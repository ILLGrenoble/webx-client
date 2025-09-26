export interface BlenderModule {
  /** Allocate size bytes in WASM memory, returns pointer */
  _malloc(size: number): number;

  /** Free pointer previously allocated with _malloc */
  _free(ptr: number): void;

  /** Blend alpha and stencil into color buffer (all in-place) */
  _alpha_and_stencil_blend(
    colorPtr: number,
    alphaPtr: number,
    stencilPtr: number,
    numPixels: number
  ): void;

  _float_sqrt(value: number): number;

  /** WASM memory view as Uint8Array */
  HEAPU8: Uint8Array;

  /** Optional: any other Emscripten module fields you need */
}

export default function createBlenderModule(): Promise<BlenderModule>;

