import * as THREE from 'three';
import {WebXTexture} from "./WebXTexture";
import {LinearFilter} from "three";

export const toThreeTexture = (texture: WebXTexture): THREE.Texture => {
  if (texture) {
    const threeTexture = texture.data ? new THREE.DataTexture(texture.data, texture.width, texture.height) : new THREE.Texture(texture.image);
    threeTexture.needsUpdate = true;
    threeTexture.flipY = texture.flipY;
    threeTexture.colorSpace = texture.colorSpace;
    threeTexture.minFilter = LinearFilter;

    return threeTexture;
  }

  return null;
}
