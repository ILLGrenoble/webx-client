
export const SRGBColorSpace = 'srgb';
export const LinearSRGBColorSpace = 'srgb-linear';

export class WebXTexture {
  image: ImageBitmap | HTMLImageElement;
  data: Uint8ClampedArray;
  colorSpace: string;
  flipY: boolean;
  width: number;
  height: number;

  constructor(data: {image?: ImageBitmap | HTMLImageElement, data?: Uint8ClampedArray, width?: number, height?: number}) {
    this.image = data.image ? data.image : null;
    this.data = data.data;
    this.width = data.image ? data.image.width : data.width;
    this.height = data.image ? data.image.height : data.height;
    this.colorSpace = SRGBColorSpace
    this.flipY = false;
  }

  isTransferable(): boolean {
    return (this.image && this.image instanceof ImageBitmap) || (this.data != null);
  }

  get transferable(): Transferable {
    if (this.image && this.image instanceof ImageBitmap) {
      return this.image;
    } else if (this.data) {
      return this.data.buffer;
    }
    return null;
  }
}

