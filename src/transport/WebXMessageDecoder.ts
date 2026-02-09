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
  WebXConnectionMessage,
  WebXNopMessage,
  WebXShapeMessage,
  WebXScreenResizeMessage,
} from '../message';
import { WebXSubImage, WebXWindowProperties } from '../common';
import {WebXTextureFactory} from '../texture';
import { WebXMessageBuffer } from './WebXMessageBuffer';
import {WebXVersion} from "../utils";
import {WebXEngine} from "../WebXEngine";

/**
 * Decodes binary messages received from the WebX Engine into WebXMessage objects.
 * This class handles various message types and converts them into their respective
 * WebXMessage implementations.
 */
export class WebXMessageDecoder {

  private readonly _textureFactory: WebXTextureFactory = new WebXTextureFactory();

  /**
   * Creates a new instance of WebXMessageDecoder.
   */
  constructor() {}

  /**
   * Decodes a binary message buffer into a WebXMessage object.
   *
   * @param buffer The binary message buffer to decode.
   * @returns A promise that resolves to the decoded WebXMessage.
   */
  decode(buffer: WebXMessageBuffer): Promise<WebXMessage> {
    const { messageTypeId } = buffer;

    if (messageTypeId === WebXMessageType.NOP) {
      return this._createNopMessage();

    } else if (messageTypeId === WebXMessageType.CONNECTION) {
      return this._createConnectionMessage(buffer);

    } else if (messageTypeId === WebXMessageType.SCREEN) {
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

    } else if (messageTypeId === WebXMessageType.SHAPE) {
      return this._createShapeMessage(buffer);

    } else if (messageTypeId === WebXMessageType.SCREEN_RESIZE) {
      return this._createScreenResizeMessage(buffer);
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
   * Creates a WebXNopMessage, which is used for no-operation messages.
   */
  private async _createNopMessage(): Promise<WebXMessage> {
    return new WebXNopMessage();
  }

  /**
   * Creates a WebXConnectionMessage, which is used for connection-related messages.
   */
  private async _createConnectionMessage(buffer: WebXMessageBuffer): Promise<WebXMessage> {
    const isStarting: number = buffer.getUint32();

    return new WebXConnectionMessage(isStarting > 0);
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

      const colorMapPromise = this._textureFactory.createTextureFromArray(colorData, mimetype);
      const alphaMapPromise = this._textureFactory.createTextureFromArray(alphaData, mimetype);

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
    const windowData: Array<{ id: number, x: number, y: number, width: number, height: number, shaped: boolean}> = new Array<{ id: number, x: number, y: number, width: number, height: number, shaped: boolean }>();
    for (let i = 0; i < numberOfWindows; i++) {
      const windowId = buffer.getUint32();
      const x = buffer.getInt32();
      const y = buffer.getInt32();
      const width = buffer.getInt32();
      const height = buffer.getInt32();

      windowData.push({ id: windowId, x: x, y: y, width: width, height: height, shaped: false });
    }

    // Update from webx-engine 1.4.0: inclusion of list of windows that have shapes (require stencil buffer)
    if (WebXEngine.version.versionNumber >= 1.4 && buffer.bufferLength - buffer.readOffset >= 4) {
      const numberOfShapedWindows: number = buffer.getUint32();
      for (let i = 0; i < numberOfShapedWindows; i++) {
        const windowId = buffer.getUint32();
        windowData.find(window => window.id === windowId).shaped = true;
      }
    }

    return new WebXWindowsMessage(windowData.map(data => new WebXWindowProperties(data)), commandId);
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
      const texture = await this._textureFactory.createTextureFromArray(imageData, 'image/png');
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
    let maxQualityIndex = 10;
    // Read the maxQualityIndex if the buffer contains it
    if (buffer.bufferLength - buffer.readOffset >= 4) {
      maxQualityIndex = buffer.getInt32();
    }
    // Read the engine version values if the buffer contains it
    let majorVersion = 0;
    let minorVersion = 0;
    let patchVersion = 0;
    if (buffer.bufferLength - buffer.readOffset >= 12) {
      majorVersion = buffer.getUint32();
      minorVersion = buffer.getUint32();
      patchVersion = buffer.getUint32();
    }
    WebXEngine.version = new WebXVersion(majorVersion, minorVersion, patchVersion);

    return new WebXScreenMessage({ width: screenWidth, height: screenHeight }, maxQualityIndex, new WebXVersion(majorVersion, minorVersion, patchVersion), commandId);
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

  /**
   * Decodes a buffer into a WebXShapeMessage.
   *
   * @param buffer The binary message buffer to decode.
   * @returns A promise that resolves to a WebXShapeMessage.
   */
  private _createShapeMessage(buffer: WebXMessageBuffer): Promise<WebXShapeMessage> {
    return new Promise<WebXShapeMessage>((resolve) => {
      const commandId: number = buffer.getUint32();
      const windowId = buffer.getUint32();
      const imageType = buffer.getString(4);
      const mimetype = this._determineMimeType(imageType);
      const stencilDataSize = buffer.getUint32();
      const stencilData: Uint8Array = buffer.getUint8Array(stencilDataSize);

      this._textureFactory.createTextureFromArray(stencilData, mimetype).then(stencilMap => {
        resolve(new WebXShapeMessage(windowId, stencilMap, commandId, buffer.bufferLength))
      })
    });
  }


  /**
   * Decodes a buffer into a WebXScreenResizeMessage containing the new screen dimensions
   *
   * @param buffer The binary message buffer to decode.
   * @returns A promise that resolves to a WebXScreenResizeMessage.
   */
  private async _createScreenResizeMessage(buffer: WebXMessageBuffer): Promise<WebXScreenResizeMessage> {
    const width = buffer.getInt32();
    const height = buffer.getInt32();
    return new WebXScreenResizeMessage({width, height});
  }

}
