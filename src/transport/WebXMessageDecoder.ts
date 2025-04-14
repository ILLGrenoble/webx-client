import {
  WebXCursorImageMessage,
  WebXImageMessage,
  WebXMessage,
  WebXMessageType,
  WebXMouseMessage,
  WebXScreenMessage,
  WebXSubImagesMessage,
  WebXWindowsMessage,
  WebXPingMessage,
  WebXQualityMessage,
  WebXClipboardMessage,
} from '../message';
import { WebXSubImage, WebXTextureFactory, WebXWindowProperties } from '../display';
import { WebXMessageBuffer } from './WebXMessageBuffer';
import {LinearSRGBColorSpace, SRGBColorSpace} from "three";

/**
 * Decodes binary messages received from the WebX Engine into WebXMessage objects.
 * This class handles various message types and converts them into their respective
 * WebXMessage implementations.
 */
export class WebXMessageDecoder {
  /**
   * Creates a new instance of WebXMessageDecoder.
   *
   * @param _textureFactory The texture factory used to create textures from image data.
   */
  constructor(private _textureFactory: WebXTextureFactory) {}

  /**
   * Decodes a binary message buffer into a WebXMessage object.
   *
   * @param buffer The binary message buffer to decode.
   * @returns A promise that resolves to the decoded WebXMessage.
   */
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
      return this._createPingMessage();

    } else if (messageTypeId === WebXMessageType.QUALITY) {
      return this._createQualityMessage(buffer);

    } else if (messageTypeId === WebXMessageType.CLIPBOARD) {
      return this._createClipboardMessage(buffer);
    }

    console.error(`Failed to decode message with typeId ${messageTypeId}`);
  }

  /**
   * Determines the MIME type of an image based on its type string.
   *
   * @param imageType The image type string (e.g., 'jpg', 'png').
   * @returns The corresponding MIME type.
   */
  private _determineMimeType(imageType: string): string {
    if (imageType.substr(0, 3) === 'jpg') {
      return 'image/jpeg';
    } else if (imageType.substr(0, 3) === 'png') {
      return 'image/png';
    }
    return 'image/bmp';
  }

  /**
   * Decodes a buffer into a WebXImageMessage.
   *
   * @param buffer The binary message buffer to decode.
   * @returns A promise that resolves to a WebXImageMessage.
   */
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

      const colorMapPromise = this._textureFactory.createTextureFromArray(colorData, mimetype, SRGBColorSpace);
      const alphaMapPromise = this._textureFactory.createTextureFromArray(alphaData, mimetype, LinearSRGBColorSpace);

      Promise.all([colorMapPromise, alphaMapPromise])
        .then(([colorMap, alphaMap]) => {
          resolve(new WebXImageMessage(windowId, depth, colorMap, alphaMap, commandId, buffer.bufferLength));
        });
    });
  }

  /**
   * Decodes a buffer into a WebXSubImagesMessage containing multiple sub-images.
   *
   * @param buffer The binary message buffer to decode.
   * @returns A promise that resolves to a WebXSubImagesMessage.
   */
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
          const colorMapPromise = this._textureFactory.createTextureFromArray(colorData, mimetype, SRGBColorSpace);
          const alphaMapPromise = this._textureFactory.createTextureFromArray(alphaData, mimetype, LinearSRGBColorSpace);

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

  /**
   * Decodes a buffer into a WebXMouseMessage, which contains mouse position and cursor ID.
   *
   * @param buffer The binary message buffer to decode.
   * @returns A promise that resolves to a WebXMouseMessage.
   */
  private async _createMouseMessage(buffer: WebXMessageBuffer): Promise<WebXMouseMessage> {
    const commandId: number = buffer.getUint32();
    const x = buffer.getInt32();
    const y = buffer.getInt32();
    const cursorId = buffer.getUint32();
    return new WebXMouseMessage(x, y, cursorId, commandId);
  }

  /**
   * Decodes a buffer into a WebXWindowsMessage, which contains information about multiple windows.
   *
   * @param buffer The binary message buffer to decode.
   * @returns A promise that resolves to a WebXWindowsMessage.
   */
  private async _createWindowsMessage(buffer: WebXMessageBuffer): Promise<WebXWindowsMessage> {
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
    return new WebXWindowsMessage(windows, commandId);
  }

  /**
   * Decodes a buffer into a WebXCursorImageMessage, which contains cursor image data.
   *
   * @param buffer The binary message buffer to decode.
   * @returns A promise that resolves to a WebXCursorImageMessage.
   */
  private async _createCursorImageMessage(buffer: WebXMessageBuffer): Promise<WebXCursorImageMessage> {
    const commandId: number = buffer.getUint32();
    const x = buffer.getInt32();
    const y = buffer.getInt32();
    const xHot = buffer.getInt32();
    const yHot = buffer.getInt32();
    const cursorId = buffer.getUint32();
    const imageDataSize = buffer.getUint32();
    const imageData: Uint8Array = buffer.getUint8Array(imageDataSize);

    try {
      const texture = await this._textureFactory.createTextureFromArray(imageData, 'image/png', SRGBColorSpace);
      return new WebXCursorImageMessage(x, y, xHot, yHot, cursorId, texture, commandId);

    } catch (error) {
      console.error(`Failed to get texture for cursor image: ${error}`);
    }
  }

  /**
   * Decodes a buffer into a WebXScreenMessage, which contains screen dimensions.
   *
   * @param buffer The binary message buffer to decode.
   * @returns A promise that resolves to a WebXScreenMessage.
   */
  private async _createScreenMessage(buffer: WebXMessageBuffer): Promise<WebXScreenMessage> {
    const commandId: number = buffer.getUint32();
    const screenWidth: number = buffer.getInt32();
    const screenHeight: number = buffer.getInt32();
    return new WebXScreenMessage({ width: screenWidth, height: screenHeight }, commandId);
  }

  /**
   * Creates a WebXPingMessage, which is used for pinging purposes.
   *
   * @returns A promise that resolves to a WebXPingMessage.
   */
  private async _createPingMessage(): Promise<WebXPingMessage> {
    return new WebXPingMessage();
  }

  /**
   * Decodes a buffer into a WebXQualityMessage, which contains quality metrics.
   *
   * @param buffer The binary message buffer to decode.
   * @returns A promise that resolves to a WebXQualityMessage.
   */
  private async _createQualityMessage(buffer: WebXMessageBuffer): Promise<WebXQualityMessage> {
    const index: number = buffer.getUint32();
    const imageFPS: number = buffer.getFloat();
    const rgbQuality: number = buffer.getFloat();
    const alphaQuality: number = buffer.getFloat();
    const maxMbps: number = buffer.getFloat();
    return new WebXQualityMessage(index, imageFPS, rgbQuality, alphaQuality, maxMbps);
  }

  /**
   * Decodes a buffer into a WebXClipboardMessage, which contains X11 clipboard content.
   *
   * @param buffer The binary message buffer to decode.
   * @returns A promise that resolves to a WebXClipboardMessage.
   */
  private async _createClipboardMessage(buffer: WebXMessageBuffer): Promise<WebXClipboardMessage> {
    const clipboardContentSize: number = buffer.getUint32();
    const clipboardContent: string = buffer.getString(clipboardContentSize);
    return new WebXClipboardMessage(clipboardContent);
  }

}
