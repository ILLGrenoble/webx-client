function alphaWorkerFunc() {
  self.onmessage = (e) => {
    const { id, colorBuffer, alphaBuffer, width, height } = e.data;
    const colorData = new Uint8ClampedArray(colorBuffer);
    const alphaData = new Uint8ClampedArray(alphaBuffer);

    // Blend alpha (green channel -> alpha)
    for (let i = 0; i < colorData.length; i += 4) {
      colorData[i + 3] = alphaData[i + 1];
    }

    // @ts-ignore
    self.postMessage({ id, colorBuffer: colorData.buffer, width, height }, [colorData.buffer]);
  };
}

export class WebXAlphaBlender {
  private _worker: Worker;
  private _pending = new Map<number, (imageData: ImageData) => void>();
  private _nextId = 1;

  constructor() {
    if (typeof Worker !== "undefined") {
      // console.log("Web Workers are available");
      const blob = new Blob(["(", alphaWorkerFunc.toString(), ")()"], { type: "application/javascript" });
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

    } else {
      // console.log("Web Workers are NOT available");
    }
  }

  public async blendAlpha(colorImageData: ImageData, alphaImageData: ImageData): Promise<ImageData> {
    return new Promise((resolve) => {
      if (this._worker) {
        const id = this._nextId++;
        this._pending.set(id, resolve);

        this._worker.postMessage(
          {
            id,
            colorBuffer: colorImageData.data.buffer,
            alphaBuffer: alphaImageData.data.buffer,
            width: colorImageData.width,
            height: colorImageData.height,
          },
          [colorImageData.data.buffer, alphaImageData.data.buffer]
        );

      } else {
        for (let i = 0; i < colorImageData.data.length; i += 4) {
          colorImageData.data[i + 3] = alphaImageData.data[i + 1];
        }
        resolve(colorImageData);
      }
    });
  }

  public terminate() {
    this._worker.terminate();
    this._pending.clear();
  }
}
