import {WebXFilterMaterial} from "./WebXFilterMaterial";
import {Color, Texture} from "three";

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D tDiffuse;
uniform float time;
uniform float curvature;
uniform float scanlineIntensity;
uniform float scanlineCount;
uniform float vignetteIntensity;
uniform float noiseIntensity;
uniform float flickerIntensity;
uniform float rgbOffset;
uniform float brightness;
uniform float contrast;
uniform vec3 backgroundColor;
varying vec2 vUv;

// Random noise function
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Apply screen curvature
vec2 curveRemapUV(vec2 uv) {
  uv = uv * 2.0 - 1.0;
  vec2 offset = abs(uv.yx) / vec2(curvature, curvature);
  uv = uv + uv * offset * offset;
  uv = uv * 0.5 + 0.5;
  return uv;
}

void main() {
  // Apply screen curvature
  vec2 remappedUv = curveRemapUV(vUv);
  vec3 color = vec3(0.0);

  // Check if UV is outside the curved screen
  if (remappedUv.x < 0.0 || remappedUv.x > 1.0 || remappedUv.y < 0.0 || remappedUv.y > 1.0) {
    gl_FragColor = vec4(backgroundColor, 1.0);
    return;
  }

  // RGB color separation (chromatic aberration)
  float r = texture2D(tDiffuse, remappedUv + vec2(rgbOffset, 0.0)).r;
  float g = texture2D(tDiffuse, remappedUv).g;
  float b = texture2D(tDiffuse, remappedUv - vec2(rgbOffset, 0.0)).b;
  color = vec3(r, g, b);

  // Apply scanlines
  float scanline = sin(remappedUv.y * scanlineCount * 3.14159 * 2.0) * 0.5 + 0.5;
  scanline = pow(scanline, 1.0) * scanlineIntensity;
  color *= 1.0 - scanline;

  // Apply noise
  float noise = random(vUv + vec2(time * 0.01, 0.0)) * noiseIntensity;
  color += noise;

  // Apply flicker
  float flicker = random(vec2(time * 0.1, 0.0)) * flickerIntensity;
  color *= 1.0 - flicker;

  // Apply vignette
  float vignette = length(vUv - 0.5) * vignetteIntensity;
  color *= 1.0 - vignette;

  // Apply brightness and contrast
  color = (color - 0.5) * contrast + 0.5;
  color *= brightness;

  // Add subtle phosphor glow
  float glow = max(max(r, g), b) * 0.3;
  color += vec3(glow * 0.3, glow * 0.2, glow * 0.4);

  gl_FragColor = vec4(color, 1.0);
}
`;

/**
 * Convert a params object into Three.js shader uniform descriptors.
 *
 * @param params - Optional overrides for default uniform values.
 * @returns An object mapping uniform names to `{ value: ... }` descriptors.
 */
const toUniforms = (params?: any): any => {
  params = params || {};
  const parameters = {
    time: 0.0,
    tDiffuse: null,
    curvature: 10.0, // 2.0,
    scanlineIntensity: 0.2, // 0.2
    scanlineCount: 800, // 800
    vignetteIntensity: 0.7, //1.3,
    noiseIntensity: 0.08, // 0.05
    flickerIntensity: 0.03, // 0.03
    rgbOffset: 0.0008, // 0.002
    brightness: 1.1, // 1.1
    contrast: 1.05,
    backgroundColor: '#000000',
    ...params || {}
  };
  return Object.fromEntries(
    Object.entries(parameters).map(([k, v]) => {
      let value = params[k] == null ? v : params[k];
      if (k === 'backgroundColor') {
        value = new Color(value);
      }
      return [k, { value }];
    })
  );
}

/**
 * WebXCRTFilterMaterial
 *
 * Shader-based post-process material emulating CRT/tube display effects:
 * curvature, scanlines, vignette, noise/flicker, chromatic aberration,
 * brightness/contrast adjustment and phosphor glow. Extends `WebXFilterMaterial`
 * and exposes a `tDiffuse` setter plus an `update()` method for time-based animation.
 */
export class WebXCRTFilterMaterial extends WebXFilterMaterial {
  /**
   * Start time used to drive `time` uniform (in seconds).
   * @private
   */
  private _startTime = new Date().getTime() / 1000;

  /**
   * Set the source texture for the filter (`tDiffuse` uniform).
   *
   * @param value - Three.js `Texture` containing the scene to be filtered.
   */
  set tDiffuse(value: Texture) {
    this.uniforms.tDiffuse.value = value;
  }

  /**
   * Construct a new CRT filter material.
   *
   * @param params - Optional parameter overrides for the filter uniforms.
   */
  constructor(params?: any) {
    super({
      uniforms: toUniforms(params),
      vertexShader,
      fragmentShader,
      transparent: false,
      depthTest: false,
    });
  }

  /**
   * Update per-frame state for the material.
   *
   * Updates the `time` uniform based on the elapsed time since construction.
   * Called by the owning `WebXFilter` before rendering the filter pass.
   */
  public update(): void {
    const current = new Date().getTime() / 1000;
    this.uniforms.time.value = (current - this._startTime) * 0.3;
  }

}
