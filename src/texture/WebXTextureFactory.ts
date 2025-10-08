import {WebXTexture} from "./WebXTexture";

/**
 * Factory class for creating textures for WebX windows from image data.
 */
export class WebXTextureFactory {

  constructor() {}

  /**
   * Creates a texture from raw image data.
   *
   * @param imageData The raw image data as a Uint8Array.
   * @param mimetype The MIME type of the image data (e.g., "image/png").
   * @param colorSpace The color space of the image data (e.g., "srgb").
   * @returns A promise that resolves to the created texture.
   */
  public async createTextureFromArray(imageData: Uint8Array, mimetype: string, colorSpace: string): Promise<WebXTexture> {
    if (imageData != null && imageData.byteLength > 0) {
      const blob = new Blob([imageData], { type: mimetype });
      const texture = await this.createTextureFromBlob(blob);


      texture.flipY = false;
      texture.colorSpace = colorSpace;

      return texture;

    } else {
      return null;
    }
  }

  /**
   * Creates a texture from a Blob object.
   *
   * @param blob The Blob object containing the image data.
   * @returns A promise that resolves to the created texture.
   */
  public createTextureFromBlob(blob: Blob): Promise<WebXTexture> {
    // not supported by all of the browsers at the moment
    // https://caniuse.com/createimagebitmap
    if (typeof createImageBitmap === 'function') {
      return new Promise<WebXTexture>((resolve, reject) => {
        createImageBitmap(blob)
          .then(bitmap => {
            const texture = new WebXTexture(bitmap);

            resolve(texture);
          })
          .catch(error => {
            console.warn(`Failed to create texture using createImageBitmap from binary data: ${error}`);
            reject(error);
          });
      });

    } else {
      return new Promise<WebXTexture>((resolve, reject) => {
        // fall back to the standard way of creating an image
        const url = URL.createObjectURL(blob);
        const image: HTMLImageElement = new Image();
        image.onload = () => {
          URL.revokeObjectURL(url);

          const texture = new WebXTexture(image);

          resolve(texture);
        };

        image.onerror = (error) => {
          console.warn(`Failed to create texture from binary data: ${error}`);
          reject(error);
        }

        image.src = url;
      });
    }
  }
}
