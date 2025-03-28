import {WebXTunnel} from '../tunnel';
import {WebXImageInstruction} from '../instruction';
import {LinearFilter, SRGBColorSpace, Texture} from 'three';
import {WebXImageMessage} from '../message';

export class WebXTextureFactory {

  constructor(private _tunnel: WebXTunnel) {}

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

  public async createTextureFromArray(imageData: Uint8Array, mimetype: string): Promise<Texture> {
    if (imageData != null && imageData.byteLength > 0) {
      const blob = new Blob([imageData], { type: mimetype });
      const texture = await this.createTextureFromBlob(blob);


      texture.needsUpdate = true;
      texture.flipY = false;
      texture.minFilter = LinearFilter;
      texture.colorSpace = SRGBColorSpace;

      return texture;

    } else {
      return null;
    }
  }

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
