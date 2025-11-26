import * as THREE from "three";
import {Camera, Scene} from "three";
import {WebXFilterMaterial} from "./WebXFilterMaterial";
import {WebXCRTFilterMaterial} from "./WebXCRTFilterMaterial";


export class WebXFilter {

  private _renderer: THREE.WebGLRenderer;

  private readonly _sceneScreen: THREE.Scene;
  private readonly _filterMaterial: WebXFilterMaterial;
  private readonly _rtTexture: THREE.WebGLRenderTarget = null;

  constructor(renderer: THREE.WebGLRenderer, screenWidth: number, screenHeight: number, filterMaterial?: WebXFilterMaterial) {
    this._renderer = renderer;
    this._filterMaterial = filterMaterial;

    if (filterMaterial) {
      this._sceneScreen = new THREE.Scene();
      this._rtTexture = new THREE.WebGLRenderTarget(screenWidth, screenHeight);
      this._filterMaterial.tDiffuse = this._rtTexture.texture;

      const plane = new THREE.PlaneGeometry(screenWidth, screenHeight);
      // this._filterMaterial = new WebXTestFilterMaterial({map: this._rtTexture.texture});
      // this._filterMaterial = new WebXCRTFilterMaterial({tDiffuse: this._rtTexture.texture, backgroundColor});

      const mesh = new THREE.Mesh(plane, this._filterMaterial);
      mesh.rotateX(Math.PI);
      mesh.position.set(0.5 * screenWidth, 0.5 * screenHeight, 10);

      this._sceneScreen.add(mesh);

    }
  }

  public render(scene: Scene, camera: Camera, isSceneDirty: boolean): void {
    if (isSceneDirty) {
      this._renderer.setRenderTarget(this._rtTexture)
      this._renderer.render(scene, camera);
      this._renderer.setRenderTarget(null);
    }

    if (this._sceneScreen) {
      this._filterMaterial.update();
      this._renderer.render(this._sceneScreen, camera);
    }
  }
}
