import createBlenderModule from  './blender.js'

function alphaAndStencilBlend(colorData, alphaData, stencilData) {
  // Blend alpha (green channel -> alpha)
  if (alphaData && stencilData) {
    for (let i = 0; i < colorData.length; i += 4) {
      // if (stencilData[i] < 128) {
      //   colorData[i + 3] = 0;
      //
      // } else {
        colorData[i + 3] = alphaData[i + 1];
      // }
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

(async () => {
  const input = 16;
  const Module = await createBlenderModule();

  const sqrt = Module._float_sqrt(input);
  console.log(`sqrt of ${input} = ${sqrt}`);

  const numPixels = 1680 * 1050;
  const byteLen = numPixels * 4;

  console.log(`Initialising data arrays`);

  const colorData = new Uint8Array(byteLen);
  const alphaData = new Uint8Array(byteLen);
  const stencilData = new Uint8Array(byteLen);
  for (let i = 0; i < numPixels; i++) {
    colorData[i] = Math.round(Math.random() * 255);
    alphaData[i] = Math.round(Math.random() * 255);
    stencilData[i] = Math.round(Math.random() * 255);
  }


  const nTests = 100;

  console.log(`calling blend function ${nTests} times...`);
  let startTime = performance.now();
  for (let i = 0; i < nTests; i++) {

    const colorPtr = Module._malloc(byteLen);
    Module.HEAPU8.set(colorData, colorPtr);
    const alphaPtr = Module._malloc(byteLen);
    Module.HEAPU8.set(alphaData, alphaPtr);
    const stencilPtr = Module._malloc(byteLen);
    Module.HEAPU8.set(stencilData, stencilPtr);

    // Module._alpha_and_stencil_blend(colorPtr, alphaPtr, stencilPtr, numPixels);
    Module._alpha_and_stencil_blend(colorPtr, alphaPtr, stencilPtr, numPixels);

    // read back the color buffer
    const resultBytes = new Uint8ClampedArray(Module.HEAPU8.buffer, colorPtr, byteLen);
    // copy to a fresh ArrayBuffer because HEAPU8 will be freed
    const copied = new Uint8ClampedArray(byteLen);
    copied.set(resultBytes);

    // free wasm memory
    Module._free(colorPtr);
    Module._free(alphaPtr);
    Module._free(stencilPtr);
  }
  let endTime = performance.now();

  console.log(`WASM Time to blend alpha image = ${(endTime - startTime).toFixed((3))}ms total, ${((endTime - startTime) / nTests).toFixed((3))}ms per call, for ${numPixels} pixels`);

  console.log(`calling blend function ${nTests} times...`);
  startTime = performance.now();
  for (let i = 0; i < nTests; i++) {
    alphaAndStencilBlend(colorData, alphaData, stencilData);
  }
  endTime = performance.now();

  console.log(`JS Time to blend alpha image = ${(endTime - startTime).toFixed((3))}ms total, ${((endTime - startTime) / nTests).toFixed((3))}ms per call, for ${numPixels} pixels`);


})();





