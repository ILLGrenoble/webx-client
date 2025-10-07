
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
