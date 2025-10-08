
export const SRGBColorSpace = 'srgb';
export const LinearSRGBColorSpace = 'srgb-linear';

export class WebXTexture {
  image: ImageBitmap | HTMLImageElement;
  colorSpace: string;
  flipY: boolean;

  constructor(image: ImageBitmap | HTMLImageElement) {
    this.image = image;
    this.colorSpace = SRGBColorSpace
    this.flipY = false;
  }

  isTransferable(): boolean {
    return this.image && this.image instanceof ImageBitmap;
  }
}

