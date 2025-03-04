import {
  WebXCursorImageMessage,
  WebXImageMessage,
  WebXMessage,
  WebXMessageType,
  WebXMouseMessage,
  WebXScreenMessage,
  WebXSubImagesMessage,
  WebXWindowsMessage,
  WebXPingMessage
} from '../message';
import { WebXSubImage, WebXTextureFactory, WebXWindowProperties } from '../display';
import { WebXMessageBuffer } from './WebXMessageBuffer';

export class WebXMessageDecoder {

  constructor(private _textureFactory: WebXTextureFactory) {
  }

  decode(buffer: WebXMessageBuffer): Promise<WebXMessage> {
    const { messageTypeId } = buffer;

    if (messageTypeId === WebXMessageType.SCREEN) {
      return this._createScreenMessage(buffer);

    } else if (messageTypeId === WebXMessageType.WINDOWS) {
      return this._createWindowsMessage(buffer);

    } else if (messageTypeId === WebXMessageType.IMAGE) {
      return this._createImageMessage(buffer);

    } else if (messageTypeId === WebXMessageType.SUBIMAGES) {
      return this._createSubImagesMessage(buffer);

    } else if (messageTypeId === WebXMessageType.MOUSE) {
      return this._createMouseMessage(buffer);

    } else if (messageTypeId === WebXMessageType.CURSOR_IMAGE) {
      return this._createCursorImageMessage(buffer);

    } else if (messageTypeId === WebXMessageType.PING) {
      return this._createPingMessage(buffer);
    }

    console.error(`Failed to decode message with typeId ${messageTypeId}`);
  }

  private _determineMimeType(imageType: string): string {
    if (imageType.substr(0, 3) === 'jpg') {
      return 'image/jpeg';
    } else if (imageType.substr(0, 3) === 'png') {
      return 'image/png';
    }
    return 'image/bmp';
  }

  private _createImageMessage(buffer: WebXMessageBuffer): Promise<WebXImageMessage> {
    return new Promise<WebXImageMessage>((resolve) => {
      const commandId: number = buffer.getUint32();
      const windowId = buffer.getUint32();
      const depth = buffer.getUint32();
      const imageType = buffer.getString(4);
      const mimetype = this._determineMimeType(imageType);
      const colorDataSize = buffer.getUint32();
      const alphaDataSize = buffer.getUint32();
      const colorData: Uint8Array = buffer.getUint8Array(colorDataSize);
      const alphaData: Uint8Array = buffer.getUint8Array(alphaDataSize);

      const colorMapPromise = this._textureFactory.createTextureFromArray(colorData, mimetype);
      const alphaMapPromise = this._textureFactory.createTextureFromArray(alphaData, mimetype);

      Promise.all([colorMapPromise, alphaMapPromise])
        .then(([colorMap, alphaMap]) => {
          resolve(new WebXImageMessage(windowId, depth, colorMap, alphaMap, commandId, buffer.bufferLength));
        });
    });
  }

  private _createSubImagesMessage(buffer: WebXMessageBuffer): Promise<WebXSubImagesMessage> {
    return new Promise<WebXSubImagesMessage>((resolve) => {
      const commandId: number = buffer.getUint32();
      const windowId = buffer.getUint32();
      const imagePromises = new Array<Promise<WebXSubImage>>();
      const numberOfSubImages = buffer.getUint32();
      for (let i = 0; i < numberOfSubImages; i++) {
        const x = buffer.getInt32();
        const y = buffer.getInt32();
        const width = buffer.getInt32();
        const height = buffer.getInt32();
        const depth = buffer.getUint32();
        const imageType = buffer.getString(4);
        const mimetype = this._determineMimeType(imageType);
        const colorDataSize = buffer.getUint32();
        const alphaDataSize = buffer.getUint32();
        const colorData: Uint8Array = buffer.getUint8Array(colorDataSize);
        const alphaData: Uint8Array = buffer.getUint8Array(alphaDataSize);

        const imagePromise = new Promise<WebXSubImage>((innerResolve, innerReject) => {
          const colorMapPromise = this._textureFactory.createTextureFromArray(colorData, mimetype);
          const alphaMapPromise = this._textureFactory.createTextureFromArray(alphaData, mimetype);

          Promise.all([colorMapPromise, alphaMapPromise])
            .then(([colorMap, alphaMap]) => {
              innerResolve(new WebXSubImage({ x, y, width, height, depth, colorMap, alphaMap }));
            })
            .catch(innerReject);
        });
        imagePromises.push(imagePromise);
      }

      Promise.all(imagePromises).then((webXSubImages: WebXSubImage[]) => {
        resolve(new WebXSubImagesMessage(windowId, webXSubImages, commandId, buffer.bufferLength));
      });

    });
  }

  private _createMouseMessage(buffer: WebXMessageBuffer): Promise<WebXMouseMessage> {
    return new Promise<WebXMouseMessage>((resolve) => {
      const commandId: number = buffer.getUint32();
      const x = buffer.getInt32();
      const y = buffer.getInt32();
      const cursorId = buffer.getUint32();
      resolve(new WebXMouseMessage(x, y, cursorId, commandId));
    });
  }

  private _createWindowsMessage(buffer: WebXMessageBuffer): Promise<WebXWindowsMessage> {
    return new Promise<WebXWindowsMessage>((resolve) => {
      const commandId: number = buffer.getUint32();
      const numberOfWindows: number = buffer.getUint32();
      const windows: Array<WebXWindowProperties> = new Array<WebXWindowProperties>();
      for (let i = 0; i < numberOfWindows; i++) {
        const windowId = buffer.getUint32();
        const x = buffer.getInt32();
        const y = buffer.getInt32();
        const width = buffer.getInt32();
        const height = buffer.getInt32();

        windows.push(new WebXWindowProperties({ id: windowId, x: x, y: y, width: width, height: height }));
      }
      resolve(new WebXWindowsMessage(windows, commandId));
    });
  }

  private _createCursorImageMessage(buffer: WebXMessageBuffer): Promise<WebXCursorImageMessage> {
    return new Promise<WebXCursorImageMessage>((resolve) => {
      const commandId: number = buffer.getUint32();
      const x = buffer.getInt32();
      const y = buffer.getInt32();
      const xHot = buffer.getInt32();
      const yHot = buffer.getInt32();
      const cursorId = buffer.getUint32();
      const imageDataSize = buffer.getUint32();
      const imageData: Uint8Array = buffer.getUint8Array(imageDataSize);

      this._textureFactory.createTextureFromArray(imageData, 'image/png')
        .then(texture => {
          resolve(new WebXCursorImageMessage(x, y, xHot, yHot, cursorId, texture, commandId));
        })
        .catch(() => {
          console.error('Failed to get texture for cursor image');
        });
    });
  }

  private _createScreenMessage(buffer: WebXMessageBuffer): Promise<WebXScreenMessage> {
    return new Promise<WebXScreenMessage>((resolve) => {
      const commandId: number = buffer.getUint32();
      const screenWidth: number = buffer.getInt32();
      const screenHeight: number = buffer.getInt32();
      resolve(new WebXScreenMessage({ width: screenWidth, height: screenHeight }, commandId));
    });
  }

  private _createPingMessage(buffer: WebXMessageBuffer): Promise<WebXPingMessage> {
    return new Promise<WebXPingMessage>((resolve) => {
      resolve(new WebXPingMessage());
    });
  }

}
