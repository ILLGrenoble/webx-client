import {WebXTunnel} from '../tunnel';
import {WebXImageInstruction, WebXShapeInstruction} from '../instruction';
import {LinearFilter, Texture} from 'three';
import {WebXImageMessage, WebXShapeMessage} from '../message';

/**
 * Factory class for creating and managing textures for WebX windows.
 *
 * This class retrieves textures from the WebX Engine and caches them for reuse.
 */
export class WebXTextureFactory {

  constructor(private _tunnel: WebXTunnel) {}

  /**
   * Retrieves the textures (colorMap and alphaMap) for a specific window ID from the WebX Engine.
   *
   * @param windowId The ID of the window to retrieve the texture for.
   * @returns A promise that resolves to the textures and associated data.
   */
  public async getWindowTexture(windowId: number): Promise<{ depth: number; colorMap: Texture; alphaMap: Texture }> {
    try {
      const response = await this._tunnel.sendRequest(new WebXImageInstruction(windowId)) as WebXImageMessage;
      return {
        depth: response.depth,
        colorMap: response.colorMap,
        alphaMap: response.alphaMap,
      };

    } catch (err) {
      console.warn('Failed to get texture: ' + err);
    }
  }

  /**
   * Retrieves the stencil textures for a specific window ID from the WebX Engine.
   *
   * @param windowId The ID of the window to retrieve the texture for.
   * @returns A promise that resolves to the stencil texture
   */
  public async getWindowStencilTexture(windowId: number): Promise<{ stencilMap: Texture }> {
    try {
      const response = await this._tunnel.sendRequest(new WebXShapeInstruction(windowId)) as WebXShapeMessage;
      return {
        stencilMap: response.stencilMap,
      };

    } catch (err) {
      console.warn('Failed to get stencil texture: ' + err);
      return null;
    }
  }

  /**
   * Creates a texture from a base64-encoded image data.
   *
   * @param imageData The base64-encoded image data.
   * @returns A promise that resolves to the created texture.
   */
  public createTextureFromBase64Array(imageData: string): Promise<Texture> {
    return new Promise<Texture>((resolve, reject) => {
      if (imageData != null && imageData !== '') {
        const image: HTMLImageElement = new Image();
        const texture: Texture = new Texture(image);
        image.onload = () => {
          texture.needsUpdate = true;
          texture.flipY = false;
          texture.minFilter = LinearFilter;

          resolve(texture);
        };

        image.onerror = (error) => {
          console.warn(`Failed to create texture from base64: ${error}`);
          reject(error);
        }

        image.src = imageData;

      } else {
        resolve(null);
      }
    });
  }

  /**
   * Creates a texture from raw image data.
   *
   * @param imageData The raw image data as a Uint8Array.
   * @param mimetype The MIME type of the image data (e.g., "image/png").
   * @param colorSpace The color space of the image data (e.g., "srgb").
   * @returns A promise that resolves to the created texture.
   */
  public async createTextureFromArray(imageData: Uint8Array, mimetype: string, colorSpace: string): Promise<Texture> {
    if (imageData != null && imageData.byteLength > 0) {
      const blob = new Blob([imageData], { type: mimetype });
      const texture = await this.createTextureFromBlob(blob);


      texture.needsUpdate = true;
      texture.flipY = false;
      texture.minFilter = LinearFilter;
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
  public createTextureFromBlob(blob: Blob): Promise<Texture> {
    // not supported by all of the browsers at the moment
    // https://caniuse.com/createimagebitmap
    if (typeof createImageBitmap === 'function') {
      return new Promise<Texture>((resolve, reject) => {
        createImageBitmap(blob)
          .then(bitmap => {
            const texture: Texture = new Texture();
            texture.image = bitmap;

            resolve(texture);
          })
          .catch(error => {
            console.warn(`Failed to create texture using createImageBitmap from binary data: ${error}`);
            reject(error);
          });
      });

    } else {
      return new Promise<Texture>((resolve, reject) => {
        // fall back to the standard way of creating an image
        const url = URL.createObjectURL(blob);
        const image: HTMLImageElement = new Image();
        image.onload = () => {
          URL.revokeObjectURL(url);
          const texture: Texture = new Texture(image);

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
