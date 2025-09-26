import createBlenderModule, {BlenderModule} from './blender';

function alphaAndStencilBlend(colorData, alphaData, stencilData) {
  // Blend alpha (green channel -> alpha)
  if (alphaData && stencilData) {
    for (let i = 0; i < colorData.length; i += 4) {
      // if (stencilData[i] < 128) {
      //   colorData[i + 3] = 0;
      //
      // } else {
        colorData[i + 3] = alphaData[i + 1];
      // }
    }
  } else if (alphaData) {
    for (let i = 0; i < colorData.length; i += 4) {
      colorData[i + 3] = alphaData[i + 1];
    }

  } else if (stencilData) {
    for (let i = 0; i < colorData.length; i += 4) {
      colorData[i + 3] = stencilData[i] < 128 ? 0 : 255;
    }
  }
}

function alphaWorkerFunc() {
  let Module: BlenderModule = null;

  self.onmessage = async (e) => {
    const { id, colorBuffer, alphaBuffer, stencilBuffer, width, height } = e.data;

    if (!Module) {
      Module = await createBlenderModule();
    }

    const colorData = new Uint8ClampedArray(colorBuffer);
    const alphaData = alphaBuffer ? new Uint8ClampedArray(alphaBuffer) : null;
    const stencilData = stencilBuffer ? new Uint8ClampedArray(stencilBuffer) : null;

    alphaAndStencilBlend(colorData, alphaData, stencilData);

    // @ts-ignore
    self.postMessage({ id, colorBuffer: colorData.buffer, width, height }, [colorData.buffer]);
  };
}

export class WebXAlphaStencilBlender {
  private readonly _worker: Worker;
  private _pending = new Map<number, (imageData: ImageData) => void>();
  private _nextId = 1;
  private _blenderModule: BlenderModule;

  constructor() {
    // if (typeof Worker !== 'undefined') {
    //   const blob = new Blob([alphaAndStencilBlend.toString(), '(', alphaWorkerFunc.toString(), ')()'], { type: 'application/javascript' });
    //   const blobUrl = URL.createObjectURL(blob);
    //   this._worker = new Worker(blobUrl);
    //   URL.revokeObjectURL(blobUrl);
    //
    //   this._worker.onmessage = (e) => {
    //     const { id, colorBuffer, width, height } = e.data;
    //     const callback = this._pending.get(id);
    //     if (!callback) return;
    //     this._pending.delete(id);
    //
    //     // Recreate ImageData from transferred buffer
    //     const blendedData = new Uint8ClampedArray(colorBuffer);
    //     const blendedImageData = new ImageData(blendedData, width, height);
    //
    //     callback(blendedImageData);
    //   };
    // }
  }

  public async blendAlphaAndStencil(colorImageData: ImageData, alphaImageData: ImageData, stencilImageData: ImageData): Promise<ImageData> {
    if (!this._blenderModule) {
      this._blenderModule = await createBlenderModule();
    }

    return new Promise((resolve) => {
      if (this._worker) {
        const id = this._nextId++;
        this._pending.set(id, resolve);

        const width = colorImageData.width;
        const height = colorImageData.height;

        const colorBuffer = colorImageData.data.buffer;
        let alphaBuffer = null;
        let stencilBuffer = null;

        const transfers = [colorBuffer];

        if (alphaImageData) {
          alphaBuffer = alphaImageData.data.buffer;
          transfers.push(alphaBuffer)
        }
        if (stencilImageData) {
          stencilBuffer = stencilImageData.data.buffer;
          transfers.push(stencilBuffer)
        }

        this._worker.postMessage(
          { id, colorBuffer, alphaBuffer, stencilBuffer, width, height },
          transfers
        );

      } else {


        const numPixels = colorImageData.width * colorImageData.height;
        const byteLen = numPixels * 4;

        // allocate color buffer in wasm and copy color bytes
        const colorPtr = this._blenderModule._malloc(byteLen);
        this._blenderModule.HEAPU8.set(new Uint8Array(colorImageData.data.buffer), colorPtr);

        // allocate alpha buffer (or pass 0)
        let alphaPtr = 0;
        if (alphaImageData) {
          alphaPtr = this._blenderModule._malloc(byteLen);
          this._blenderModule.HEAPU8.set(new Uint8Array(alphaImageData.data.buffer), alphaPtr);
        }

        // allocate stencil buffer (or pass 0)
        let stencilPtr = 0;
        if (stencilImageData) {
          stencilPtr = this._blenderModule._malloc(byteLen);
          this._blenderModule.HEAPU8.set(new Uint8Array(stencilImageData.data.buffer), stencilPtr);
        }

        // call the exported function
        this._blenderModule._alpha_and_stencil_blend(colorPtr, alphaPtr || 0, stencilPtr || 0, numPixels);

        // read back the color buffer
        const resultBytes = new Uint8ClampedArray(this._blenderModule.HEAPU8.buffer, colorPtr, byteLen);
        // copy to a fresh ArrayBuffer because HEAPU8 will be freed
        const copied = new Uint8ClampedArray(byteLen);
        copied.set(resultBytes);

        // free wasm memory
        this._blenderModule._free(colorPtr);
        if (alphaPtr) this._blenderModule._free(alphaPtr);
        if (stencilPtr) this._blenderModule._free(stencilPtr);

        // construct ImageData and return
        resolve(new ImageData(copied, colorImageData.width, colorImageData.height));


        // alphaAndStencilBlend(colorImageData.data, alphaImageData?.data, stencilImageData?.data);
        // resolve(colorImageData);
      }
    });
  }

  public terminate() {
    this._worker.terminate();
    this._pending.clear();
  }
}
