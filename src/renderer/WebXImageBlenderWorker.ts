import {alphaAndStencilBlend} from "./WebXImageBlenderFunc";

/**
 * The entry point for the web worker. Receives messages with data for color, alpha and stencil data and calls the blending
 * function.
 */
self.onmessage = (e) => {
  const { id, colorBuffer, alphaBuffer, stencilBuffer, width, height } = e.data;
  const colorData = new Uint8ClampedArray(colorBuffer);
  const alphaData = alphaBuffer ? new Uint8ClampedArray(alphaBuffer) : null;
  const stencilData = stencilBuffer ? new Uint8ClampedArray(stencilBuffer) : null;

  alphaAndStencilBlend(colorData, alphaData, stencilData);

  // @ts-ignore
  self.postMessage({ id, colorBuffer: colorData.buffer, width, height }, [colorData.buffer]);
};

