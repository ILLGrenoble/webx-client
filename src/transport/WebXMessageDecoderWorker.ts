import {WebXMessageDecoder} from "./WebXMessageDecoder";
import {WebXMessageBuffer} from "./WebXMessageBuffer";
import {getMessageTransfers} from "./WebXMessageFunc";
import {WebXImageMessage, WebXMessage, WebXShapeMessage, WebXSubImagesMessage} from "../message";
import {colorAndAlphaBlendImageToImageData, imageToImageData, WebXSubImage} from "../common";
import {WebXTexture} from "../texture";

const messageDecoder = new WebXMessageDecoder();

/**
 * The entry point for the web worker that decodes message buffers. Handles primarily messages with data for color, alpha and stencil data (ie
 * WebXImageMessage, WebXSubImagesMessage, WebXShapeMessage) and calls the blending
 * function to pre-blend the color and alpha data. The raw image data is in all cases extracted from the images.
 */
self.onmessage = async (e) => {
  const { id, buffer } = e.data;

  try {
    // Decode the message
    const messageBuffer = new WebXMessageBuffer(buffer);
    let message = await messageDecoder.decode(messageBuffer);
    if (message == null) {
      console.error(`Failed to decode message data`);

    } else {
      // Perform any blending of alpha data in the worker and convert
      // any image objects into raw image data
      message = convertMessageImageToImageData(message);
    }

    // Get any elements that can be transferred
    const transfers = getMessageTransfers(message);

    // @ts-ignore
    self.postMessage({ id, message }, transfers);

  } catch (error) {
    self.postMessage({ id, error: `Caught error decoding message data: ${error.message}` });
  }
};

/**
 * Converts any image elements of the decoded message into ImageData (drawing images to canvases). If
 * both color and alpha data are available then the pixels are blended here.
 * @param message the message with images to be converted
 */
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


/**
 * Takes color and alpha map textures and converts them into a raw image data texture. If both are present,
 * the alpha and color are blended here.
 * @param colorMap the color map with image object data
 * @param alphaMap the alpha map with image object data
 */
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
