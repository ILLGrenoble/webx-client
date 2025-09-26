# WASM function to blend alpha and stencil map

The C file `blender.c` is aimed to perform optimised inner loop unrolling when compiled with -O2. The objective is to improve the performance of the blending compared to a pure JS function.

There is a small Node.js test file to compare the performance.

## Compiling

Install emscripten to compile to web assembly.

For compiling for Node.js run:

```
emcc blender.c -o blender.js -O3 -s MODULARIZE=1 -s SINGLE_FILE=1 -s EXPORT_ES6=1 -s 'EXPORT_NAME="createBlenderModule"' -s ALLOW_MEMORY_GROWTH=1 -s EXPORTED_FUNCTIONS='["_float_sqrt","_alpha_and_stencil_blend","_malloc","_free"]' -s EXPORTED_RUNTIME_METHODS='["HEAPU8"]'
```

To compile for a browser run:

```
emcc blender.c -o blender.js -O3 -s MODULARIZE=1 -s SINGLE_FILE=1 -s ENVIRONMENT=web,worker -s 'EXPORT_NAME="createBlenderModule"' -s ALLOW_MEMORY_GROWTH=1 -s EXPORTED_FUNCTIONS='["_float_sqrt","_alpha_and_stencil_blend","_malloc","_free"]' -s EXPORTED_RUNTIME_METHODS='["HEAPU8"]'
```

The wasm binary is encoded in Base64 inside the `blender.js` file to simplify integration into other projects.

## Testing

For Node.js run

```
node test.js
```

This will run the test 100 times using WASM (allocating, copying data to the wasm memory space and deallocating memory too) and with the pure js function.

With the memory allocation/copying performance seems to be approximately 2x faster (without the memory management about 10x faster).

## Integrating into web application

The compiled `blender.js` file should be copied to src/renderer (relative to the main project root folder). The WebXAlphaStencilBlender imports it.

Currently, it runs in the main thread of the js: should be put in a web-worker but the current packaging makes this harder.

Tests indicate minor, if any, performance improvement gained through this function.
