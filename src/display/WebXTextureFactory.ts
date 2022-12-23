import { WebXTunnel } from '../tunnel';
import { WebXImageInstruction } from '../instruction';
import {LinearFilter, Texture} from 'three';
import { WebXImageMessage } from '../message';

export class WebXTextureFactory {

  constructor(private _tunnel: WebXTunnel) {}

  public getWindowTexture(windowId: number): Promise<{ depth: number; colorMap: Texture; alphaMap: Texture }> {
    return new Promise<{ depth: number; colorMap: Texture; alphaMap: Texture }>((resolve) => {
      return this._tunnel.sendRequest(new WebXImageInstruction(windowId)).then((response: WebXImageMessage) => {
        resolve({
          depth: response.depth,
          colorMap: response.colorMap,
          alphaMap: response.alphaMap,
        });
      })
        .catch(err => console.warn('Failed to get texture: ' + err));
    });
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

  public createTextureFromArray(imageData: Uint8Array, mimetype: string): Promise<Texture> {
    return new Promise<Texture>((resolve, reject) => {
      if (imageData != null && imageData.byteLength > 0) {
        const blob = new Blob([imageData], { type: mimetype });
        this.createTextureFromBlob(blob)
          .then(texture => {
            texture.needsUpdate = true;
            texture.flipY = false;
            texture.minFilter = LinearFilter;

            resolve(texture);
          })
          .catch(error => {
            reject(error);
          })

      } else {
        resolve(null);
      }
    });
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
