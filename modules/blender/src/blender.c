#include <math.h>
#include <stdint.h>
#include <stdio.h>
#include <emscripten/emscripten.h>

float float_sqrt(float input) {
  return sqrt(input);
}

// color: pointer to color RGBA bytes (len = num_pixels * 4), modified in-place
// alpha: pointer to alpha image RGBA bytes or NULL (green channel used)
// stencil: pointer to stencil image RGBA bytes or NULL (uses red channel)
// num_pixels: number of pixels (width * height)
EMSCRIPTEN_KEEPALIVE
void alpha_and_stencil_blend(uint8_t* color, const uint8_t* alpha, const uint8_t* stencil, int num_pixels) {

  if (alpha) {
    uint32_t * colorSrc = (uint32_t *) color;
    uint32_t * colorDst = (uint32_t *) color;
    uint32_t * alphaSrc = (uint32_t *) (alpha - 2); // byte-shift green channel into alpha channel
    uint32_t * alphaDst = (uint32_t *) (alpha - 2);

    uint32_t * stencil32 = (uint32_t *) stencil;

    const size_t Unroll = 4;
    const size_t PixelsAtOnce = 4 * Unroll;
    const uint32_t alphaMask = 0xFF000000;
    const uint32_t rgbMask = 0x00FFFFFF;

    size_t remaining = num_pixels;
    while (remaining >= PixelsAtOnce) {
      for (size_t unrolling = 0; unrolling < Unroll; unrolling++) {
        *colorDst++ = (*colorSrc++ & rgbMask) | (*alphaSrc++ & alphaMask);
        *colorDst++ = (*colorSrc++ & rgbMask) | (*alphaSrc++ & alphaMask);
        *colorDst++ = (*colorSrc++ & rgbMask) | (*alphaSrc++ & alphaMask);
        *colorDst++ = (*colorSrc++ & rgbMask) | (*alphaSrc++ & alphaMask);
      }

      remaining -= PixelsAtOnce;
    }

    // remaining 1 to 15 uint32
    while (remaining-- != 0) {
      *colorDst++ = (*colorSrc++ & rgbMask) | (*alphaSrc++ & alphaMask);
    }
  }


//   int len = num_pixels * 4;
//   if (alpha && stencil) {
//     for (int i = 0; i < len; i += 4) {
//       if (stencil[i] < 128) {
//         color[i + 3] = 0;
//       } else {
//         color[i + 3] = alpha[i + 1];
//       }
//     }
//   } else if (alpha) {
//     for (int i = 0; i < len; i += 4) {
//       color[i + 3] = alpha[i + 1];
//     }
//   } else if (stencil) {
//     for (int i = 0; i < len; i += 4) {
//       color[i + 3] = (stencil[i] < 128) ? 0 : 255;
//     }
//   }
}
