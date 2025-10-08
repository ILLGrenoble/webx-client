import * as THREE from 'three';
import {WebXTexture} from "./WebXTexture";
import {LinearFilter} from "three";

export const toThreeTexture = (texture: WebXTexture): THREE.Texture => {
  if (texture) {
    const threeTexture = new THREE.Texture();
    threeTexture.needsUpdate = true;
    threeTexture.image = texture.image;
    threeTexture.flipY = texture.flipY;
    threeTexture.colorSpace = texture.colorSpace;
    threeTexture.minFilter = LinearFilter;

    return threeTexture;
  }

  return null;
}
