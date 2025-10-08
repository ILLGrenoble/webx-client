
/**
 * The Alpha and stencil buffer blending function. The alpha buffer contains alpha data in the
 * green channel. The stencil buffer is a black and white image: only pixels with a stencil value > 127 are to be rendered
 * @param colorData the color data array
 * @param alphaData the alpha data array
 * @param stencilData the stencil data array
 */
export const alphaAndStencilBlend = (colorData: Uint8ClampedArray, alphaData: Uint8ClampedArray, stencilData: Uint8ClampedArray) => {
  if (alphaData && stencilData) {
    for (let i = 0; i < colorData.length; i += 4) {
      if (stencilData[i] < 128) {
        colorData[i + 3] = 0;

      } else {
        colorData[i + 3] = alphaData[i + 1];
      }
    }

  } else if (alphaData) {
    for (let i = 0; i < colorData.length; i += 4) {
      colorData[i + 3] = alphaData[i + 1];
    }

  } else if (stencilData) {
    for (let i = 0; i < colorData.length; i += 4) {
      colorData[i + 3] = stencilData[i] < 128 ? 0 : 255;
    }
  }
}

/**
 * The Alpha buffer blending function. The alpha buffer contains alpha data in the
 * green channel.
 * @param colorData the color data array
 * @param alphaData the alpha data array
 */
export const alphaBufferBlend = (colorData: Uint8ClampedArray, alphaData: Uint8ClampedArray) => {
  for (let i = 0; i < colorData.length; i += 4) {
    colorData[i + 3] = alphaData[i + 1];
  }
}

/**
 * The Alpha image blending function. The alpha image contains alpha image data
 * @param colorImage the color image array
 * @param alphaImage the alpha image
 */
export const colorAndAlphaBlendImageToImageData = (colorImage: ImageBitmap | HTMLImageElement, alphaImage: ImageBitmap | HTMLImageElement): ImageData => {

  const width = colorImage.width;
  const height = colorImage.height;

  // Create temporary canvas and context for image drawing
  const canvas = new OffscreenCanvas(width, height);

  const context = canvas.getContext('2d', {willReadFrequently: true});
  context.drawImage(colorImage, 0, 0);
  const colorImageData = context.getImageData(0, 0, width, height);

  context.drawImage(alphaImage, 0, 0);
  const alphaImageData = context.getImageData(0, 0, width, height);

  alphaBufferBlend(colorImageData.data, alphaImageData.data);

  return colorImageData;
}

/**
 * Draws an image to a canvas to obtain the raw image data
 * @param image the image
 */
export const imageToImageData = (image: ImageBitmap | HTMLImageElement): ImageData => {
  if (image) {
    const width = image.width;
    const height = image.height;

    // Create temporary canvas and context for image drawing
    const canvas = new OffscreenCanvas(width, height);

    const context = canvas.getContext('2d', {willReadFrequently: true});
    context.drawImage(image, 0, 0);
    return context.getImageData(0, 0, width, height);
  }

  return null;
}
