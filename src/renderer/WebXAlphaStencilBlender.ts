function alphaAndStencilBlend(colorData, alphaData, stencilData) {
  // Blend alpha (green channel -> alpha)
  if (alphaData && stencilData) {
    for (let i = 0; i < colorData.length; i += 4) {
      if (stencilData[i] < 128) {
        colorData[i + 3] = 0;

      } else {
        colorData[i + 3] = alphaData[i + 1];
      }
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
  self.onmessage = (e) => {
    const { id, colorBuffer, alphaBuffer, stencilBuffer, width, height } = e.data;
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

  constructor() {
    if (typeof Worker !== 'undefined') {
      const blob = new Blob([alphaAndStencilBlend.toString(), '(', alphaWorkerFunc.toString(), ')()'], { type: 'application/javascript' });
      const blobUrl = URL.createObjectURL(blob);
      this._worker = new Worker(blobUrl);
      URL.revokeObjectURL(blobUrl);

      this._worker.onmessage = (e) => {
        const { id, colorBuffer, width, height } = e.data;
        const callback = this._pending.get(id);
        if (!callback) return;
        this._pending.delete(id);

        // Recreate ImageData from transferred buffer
        const blendedData = new Uint8ClampedArray(colorBuffer);
        const blendedImageData = new ImageData(blendedData, width, height);

        callback(blendedImageData);
      };
    }
  }

  public async blendAlphaAndStencil(colorImageData: ImageData, alphaImageData: ImageData, stencilImageData: ImageData): Promise<ImageData> {
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
        alphaAndStencilBlend(colorImageData.data, alphaImageData?.data, stencilImageData?.data);
        resolve(colorImageData);
      }
    });
  }

  public terminate() {
    this._worker.terminate();
    this._pending.clear();
  }
}
