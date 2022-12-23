import { WebGLRenderer, Vector2, Texture } from 'three';

export class WebXWebGLRenderer extends WebGLRenderer {
  copyTextureToTexture(position: Vector2, srcTexture: Texture, dstTexture: Texture): void;
}
