import {BackSide, Color, Matrix3, ShaderMaterial, Texture} from 'three';

const vertexShader = `
#ifdef USE_MAP
uniform mat3 mapTransform;
varying vec2 vMapUv;
#endif

#ifdef USE_ALPHAMAP
uniform mat3 alphaMapTransform;
varying vec2 vAlphaMapUv;
#endif

#ifdef USE_STENCILMAP
varying vec2 vStencilMapUv;
#endif

void main() {
#ifdef USE_MAP
  vMapUv = (mapTransform * vec3(uv, 1)).xy;
#endif

#ifdef USE_ALPHAMAP
  vAlphaMapUv = (alphaMapTransform * vec3(uv, 1)).xy;
#endif

#ifdef USE_STENCILMAP
  vStencilMapUv = uv;
#endif

  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform vec3 diffuse;
uniform float opacity;

#ifdef USE_MAP
uniform sampler2D map;
varying vec2 vMapUv;
#endif

#ifdef USE_ALPHAMAP
uniform sampler2D alphaMap;
varying vec2 vAlphaMapUv;
#endif

#ifdef USE_STENCILMAP
uniform sampler2D stencilMap;
varying vec2 vStencilMapUv;
#endif

void main() {
  vec4 diffuseColor = vec4(diffuse, opacity);

#ifdef USE_STENCILMAP
  vec4 stencil = texture2D(stencilMap, vStencilMapUv);
  if (stencil.r < 0.5) {
    discard;
  }
#endif

#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D(map, vMapUv);
  diffuseColor *= sampledDiffuseColor;
#endif

#ifdef USE_ALPHAMAP
  diffuseColor.a *= texture2D(alphaMap, vAlphaMapUv).g;
#endif

  gl_FragColor = diffuseColor;
  gl_FragColor = linearToOutputTexel( gl_FragColor );
}
`;

/**
 * WebXMaterial
 *
 * A custom ShaderMaterial that supports an optional diffuse map, alpha map, and stencil
 * texture. It exposes convenience getters/setters for these textures and synchronizes
 * texture transforms (matrix) with the shader uniforms before rendering.
 */
export class WebXMaterial extends ShaderMaterial {

  /**
   * Diffuse texture (RGB) used to modulate the material color.
   */
  get map(): Texture {
    return this.uniforms.map.value;
  }

  /**
   * Set the diffuse texture. Assigning a texture updates the `map` uniform value.
   */
  set map(value: Texture) {
    this.uniforms.map.value = value;
  }

  /**
   * Alpha texture used to control per-pixel opacity (uses the `g` channel).
   */
  get alphaMap(): Texture {
    return this.uniforms.alphaMap.value;
  }

  /**
   * Set the alpha texture. Assigning a texture updates the `alphaMap` uniform value.
   */
  set alphaMap(value: Texture) {
    this.uniforms.alphaMap.value = value;
  }

  /**
   * Stencil texture used to discard fragments where stencil.r < 0.5.
   */
  get stencilMap(): Texture {
    return this.uniforms.stencilMap.value;
  }

  /**
   * Set the stencil texture. Toggles the `USE_STENCILMAP` shader define when a texture
   * is present or removed.
   *
   * @param value - Texture to use as stencil or `null` to disable stencil testing.
   */
  set stencilMap(value: Texture) {
    this.uniforms.stencilMap.value = value;
    if (value) {
      this.defines.USE_STENCILMAP = '';
    } else {
      delete this.defines.USE_STENCILMAP;
    }
  }

  /**
   * Material base color (multiplicative with `map` if present).
   */
  get color(): Color {
    return this.uniforms.diffuse.value;
  }

  /**
   * Set the material color by copying the provided `Color`.
   *
   * @param value - New base color.
   */
  set color(value: Color) {
    this.uniforms.diffuse.value.copy(value);
  }

  /**
   * Create a new WebXMaterial.
   *
   * Options in `params`:
   * - `color` (Color | number | string): Optional initial color; forwarded to `this.color.set`.
   *
   * The material is configured with:
   * - custom vertex and fragment shaders
   * - uniforms for textures and transforms
   * - `transparent: true` to allow alpha blending
   * - `side: BackSide` suitable for inside-out rendering surfaces
   *
   * @param params - Optional initialization parameters.
   */
  constructor(params?: any) {
    super({
      uniforms: {
        map: { value: null },
        alphaMap: { value: null },
        stencilMap: { value: null },
        mapTransform: { value: new Matrix3() },
        alphaMapTransform: { value: new Matrix3() },
        diffuse: { value: new Color(0xffffff) },
        opacity: { value: 1.0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthTest: true,
      side: BackSide,
    });

    if (params && params.color) {
      this.color.set(params.color);
    }
  }

  /**
   * Lifecycle hook called before rendering the material.
   *
   * Synchronizes texture matrices to the shader uniforms when the textures' `matrixAutoUpdate`
   * flags are enabled. This allows UV transforms applied to `Texture`s to be used by the shader.
   */
  onBeforeRender(): void {
    if (this.map && this.map.matrixAutoUpdate) {
      this.map.updateMatrix();
      this.uniforms.mapTransform.value.copy(this.map.matrix);
    }

    if (this.alphaMap && this.alphaMap.matrixAutoUpdate) {
      this.alphaMap.updateMatrix();
      this.uniforms.alphaMapTransform.value.copy(this.alphaMap.matrix);
    }
  }

}
