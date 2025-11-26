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
  color.r = color.r * time + (1.0 - time) * color.g;
  color.g = color.g * time + (1.0 - time) * color.b;
  color.b = color.b * time + (1.0 - time) * color.r;
  gl_FragColor = color;
  #include <colorspace_fragment>
}
`;

export class WebXTestFilterMaterial extends WebXFilterMaterial {

  set tDiffuse(value: Texture) {
    this.uniforms.tDiffuse.value = value;
  }

  constructor(params?: any) {
    super({
      uniforms: {
        tDiffuse: { value: params?.map },
        time: { value: 1.0 },
      },
      vertexShader,
      fragmentShader,
      transparent: false,
      depthTest: false,
    });
  }

  public update(): void {
    this.uniforms.time.value = 0.5 + 0.5 * Math.sin(Date.now() * 0.0015);
  }

}
