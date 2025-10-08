import {WebXMessageDecoder} from "./WebXMessageDecoder";
import {WebXMessageBuffer} from "./WebXMessageBuffer";
import {getMessageTransfers} from "./WebXMessageFunc";
import {WebXImageMessage, WebXMessage, WebXShapeMessage, WebXSubImagesMessage} from "../message";
import {colorAndAlphaBlendImageToImageData, imageToImageData, WebXSubImage} from "../common";
import {WebXTexture} from "../texture";

const messageDecoder = new WebXMessageDecoder();

/**
 * The entry point for the web worker. Receives messages with data for color, alpha and stencil data and calls the blending
 * function.
 */
self.onmessage = async (e) => {
  const { id, buffer } = e.data;

  try {
    const messageBuffer = new WebXMessageBuffer(buffer);

    // console.log(`Decoding message of type ${messageBuffer.messageTypeId}`);
    let message = await messageDecoder.decode(messageBuffer);
    if (message == null) {
      console.error(`Failed to decode message data`);

    } else {
      // Perform any blending of alpha data in the worker
      message = convertMessageImageToImageData(message);
    }

    const transfers = getMessageTransfers(message);

    // @ts-ignore
    self.postMessage({ id, message }, transfers);

  } catch (error) {
    self.postMessage({ id, error: `Caught error decoding message data: ${error.message}` });
  }
};

const convertMessageImageToImageData = (message: WebXMessage): WebXMessage => {
  if (message instanceof WebXImageMessage) {
    const {windowId, depth, commandId, size} = message;
    const dataTexture = createDataTexture(message.colorMap, message.alphaMap);
    return new WebXImageMessage(windowId, depth, dataTexture, null, commandId, size);

  } else if (message instanceof WebXSubImagesMessage) {
    const {windowId, commandId, size} = message;
    const subImages: WebXSubImage[] = message.subImages.map(subImage => {
      const {x, y, width, height, depth} = subImage;
      const dataTexture = createDataTexture(subImage.colorMap, subImage.alphaMap);
      return new WebXSubImage({x, y, width, height, depth, colorMap: dataTexture, alphaMap: null});
    });
    return new WebXSubImagesMessage(windowId, subImages, commandId, size);

  } else if (message instanceof WebXShapeMessage) {
    const {windowId, commandId, size} = message;
    const dataTexture = createDataTexture(message.stencilMap);
    return new WebXShapeMessage(windowId, dataTexture, commandId, size);
  }

  return message;
}


const createDataTexture = (colorMap: WebXTexture, alphaMap?: WebXTexture): WebXTexture => {
  if (colorMap && alphaMap) {
    const width = colorMap.width;
    const height = colorMap.height;
    const blendedImageData = colorAndAlphaBlendImageToImageData(colorMap.image, alphaMap.image);
    return new WebXTexture({data: blendedImageData.data, width, height});

  } else if (colorMap) {
    const width = colorMap.width;
    const height = colorMap.height;
    const imageData = imageToImageData(colorMap.image)
    return new WebXTexture({data: imageData.data, width, height});
  }

  return null;
}
