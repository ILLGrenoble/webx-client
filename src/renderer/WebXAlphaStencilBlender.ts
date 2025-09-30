/**
 * The Alpha and stencil buffer blending function. The alpha buffer contains alpha data in the
 * green channel. The stencil buffer is a black and white image: only pixels with a stencil value > 127 are to be rendered
 * @param colorData the color data array
 * @param alphaData the alpha data array
 * @param stencilData the stencil data array
 */
function alphaAndStencilBlend(colorData, alphaData, stencilData) {
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

/**
 * The entry point for the web worker. Receives messages with data for color, alpha and stencil data and calls the blending
 * function.
 */
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

/**
 * The `WebXAlphaStencilBlender` class handles blending of alpha and stencil data
 * for rendering purposes. It uses a Web Worker for asynchronous processing.
 */
export class WebXAlphaStencilBlender {
  private readonly _worker: Worker;
  private _pending = new Map<number, (imageData: ImageData) => void>();
  private _nextId = 1;

  /**
   * Initializes the `WebXAlphaStencilBlender` and sets up the Web Worker (if web-workers present on the client).
   * The web worker is initialised from the worker/blending functions above. Each blending request is assigned an id.
   * The data is passed to the web worker along with the Id. The web worker returns the Id with blended data so that the
   * calling promise can be resolved.
   */
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

  /**
   * Blends alpha and stencil data asynchronously.
   * Main entry point to blend the different buffers. If a web-worker is available on the client then the data is prepared to transfer
   * to the worker. Otherwise the standard blending function is called immediately.
   * @param colorImageData - The color image data.
   * @param alphaImageData - The alpha image data.
   * @param stencilImageData - The stencil image data.
   * @returns A promise that resolves to the blended `ImageData`.
   */
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

  /**
   * Terminates the Web Worker and clears pending tasks.
   */
  public terminate() {
    this._worker.terminate();
    this._pending.clear();
  }
}
