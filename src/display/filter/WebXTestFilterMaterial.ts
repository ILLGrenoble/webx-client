import {WebXFilterMaterial} from "./WebXFilterMaterial";
import {Texture} from "three";

const vertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform float time;
uniform sampler2D tDiffuse;

void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  color.r = (1.0 - time) * color.r + time * color.g;
  color.g = (1.0 - time) * color.g + time * color.b;
  color.b = (1.0 - time) * color.b + time * color.r;
  gl_FragColor = color;
}
`;

/**
 * WebXTestFilterMaterial
 *
 * Simple test filter material used by the WebX filter pipeline. It extends
 * `WebXFilterMaterial` and provides a shader that animates channel mixing
 * driven by a `time` uniform.
 *
 * The material expects a `tDiffuse` texture (the source scene) and updates
 * the `time` uniform each frame in `update()` to animate the effect.
 *
 * @extends WebXFilterMaterial
 */
export class WebXTestFilterMaterial extends WebXFilterMaterial {

  /**
   * Set the diffuse/source texture for the filter.
   *
   * The texture is assigned to the shader uniform `tDiffuse`.
   *
   * @param value - Texture containing the scene to be filtered.
   */
  set tDiffuse(value: Texture) {
    this.uniforms.tDiffuse.value = value;
  }

  /**
   * Create a new WebXTestFilterMaterial.
   *
   * Accepts an optional `params` object. If `params.map` is provided it will be
   * used as the initial `tDiffuse` texture. The material defines a `time`
   * uniform used to animate the color-mixing effect.
   *
   * @param params - Optional parameters (e.g. `{ map: Texture }`).
   */
  constructor(params?: any) {
    super({
      uniforms: {
        tDiffuse: { value: params?.map },
        time: { value: 0.0 },
      },
      vertexShader,
      fragmentShader,
      transparent: false,
      depthTest: false,
    });
  }

  /**
   * Update per-frame state for the material.
   *
   * Updates the `time` uniform to a value in the range \[0,1\] based on the
   * current time to produce a smooth oscillation.
   */
  public update(): void {
    // this.uniforms.time.value = 0.5 + 0.5 * Math.sin(Date.now() * 0.0015);
  }

}
