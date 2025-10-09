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
} from '../message';
import {WebXMessageBuffer} from "./WebXMessageBuffer";

/**
 * Recasts an object (received from a web workder) into a concrete WebXMessage class
 * @param object the message data
 * @returns a concrete WebXMessage instance
 */
export const recastWebXMessage = (object: any): WebXMessage => {
  let message: WebXMessage;
  if (object) {
    if (object.type === WebXMessageType.NOP) {
      message = Object.create(WebXNopMessage.prototype);
    } else if (object.type === WebXMessageType.CONNECTION) {
      message = Object.create(WebXConnectionMessage.prototype);
    } else if (object.type === WebXMessageType.SCREEN) {
      message = Object.create(WebXScreenMessage.prototype);
    } else if (object.type === WebXMessageType.WINDOWS) {
      message = Object.create(WebXWindowsMessage.prototype);
    } else if (object.type === WebXMessageType.IMAGE) {
      message = Object.create(WebXImageMessage.prototype);
    } else if (object.type === WebXMessageType.SUBIMAGES) {
      message = Object.create(WebXSubImagesMessage.prototype);
    } else if (object.type === WebXMessageType.MOUSE) {
      message = Object.create(WebXMouseMessage.prototype);
    } else if (object.type === WebXMessageType.CURSOR_IMAGE) {
      message = Object.create(WebXCursorImageMessage.prototype);
    } else if (object.type === WebXMessageType.PING) {
      message = Object.create(WebXPingMessage.prototype);
    } else if (object.type === WebXMessageType.QUALITY) {
      message = Object.create(WebXQualityMessage.prototype);
    } else if (object.type === WebXMessageType.CLIPBOARD) {
      message = Object.create(WebXClipboardMessage.prototype);
    } else if (object.type === WebXMessageType.SHAPE) {
      message = Object.create(WebXShapeMessage.prototype);
    }

    if (message) {
      Object.assign(message, object);
    }

  }
  return message;
}

/**
 * Returns all image types that should be processed in the web worker: essentially all with
 * image data
 * @param messageBuffer the raw message buffer
 * @return true if the message should be decoded by a web worker
 */
export const isWorkerMessage = (messageBuffer: WebXMessageBuffer): boolean => {
  const messageType = messageBuffer.messageTypeId;
  switch (messageType) {
    case WebXMessageType.IMAGE:
    case WebXMessageType.SUBIMAGES:
    case WebXMessageType.SHAPE:
      return true;
    default:
      return false;
  }
}

/**
 * Returns all elements of the message that can be transferred from the web worker (releasing ownership and
 * avoiding copying).
 * @param message the webx message
 * @return an array of transferable objects
 */
export const getMessageTransfers = (message: WebXMessage): Transferable[] => {
  const transfers: Transferable[] = [];

  if (message) {
    const messageType = message.type;
    if (messageType == WebXMessageType.IMAGE) {
      const imageMessage = message as WebXImageMessage;
      if (imageMessage.colorMap && imageMessage.colorMap.isTransferable()) {
        transfers.push(imageMessage.colorMap.transferable);
      }
      if (imageMessage.alphaMap && imageMessage.alphaMap.isTransferable()) {
        transfers.push(imageMessage.alphaMap.transferable);
      }

    } else if (messageType == WebXMessageType.SUBIMAGES) {
      const subImageMessage = message as WebXSubImagesMessage;
      for (const subImage of subImageMessage.subImages) {
        if (subImage.colorMap && subImage.colorMap.isTransferable()) {
          transfers.push(subImage.colorMap.transferable);
        }
        if (subImage.alphaMap && subImage.alphaMap.isTransferable()) {
          transfers.push(subImage.alphaMap.transferable);
        }
      }

    } else if (messageType == WebXMessageType.SHAPE) {
      const shapeMessage = message as WebXShapeMessage;
      if (shapeMessage.stencilMap && shapeMessage.stencilMap.isTransferable()) {
        transfers.push(shapeMessage.stencilMap.transferable);
      }
    }
  }

  return transfers;
}
