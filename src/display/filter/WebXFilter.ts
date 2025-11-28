import * as THREE from "three";
import {Camera, Scene} from "three";
import {WebXFilterMaterial} from "./WebXFilterMaterial";
import {ParametricGeometries} from "three/examples/jsm/geometries/ParametricGeometries";
import plane = ParametricGeometries.plane;

/**
 * WebXFilter
 *
 * Helper that renders a provided scene into an offscreen render target and then
 * applies a full-screen filter material to that texture providing a post-processing
 * effect to the entire screen.
 */
export class WebXFilter {

  /**
   * The name of the filter
   */
  private readonly _name: string;

  /**
   * Renderer used for both offscreen and final compositing passes.
   */
  private readonly _renderer: THREE.WebGLRenderer;

  /**
   * Scene containing the single mesh used to draw the filter pass.
   *
   * Present only when a `filterMaterial` was supplied in the constructor.
   */
  private readonly _sceneScreen: THREE.Scene;

  /**
   * Material that performs the post-process/filtering step.
   */
  private readonly _filterMaterial: WebXFilterMaterial;

  /**
   * Render target used to capture the main scene before the filter is applied.
   * May be `null` if no `filterMaterial` was provided.
   */
  private readonly _rtTexture: THREE.WebGLRenderTarget = null;

  /**
   * Returns the name of the filter
   */
  get name(): string {
    return this._name;
  }

  /**
   * Create a new WebXFilter.
   *
   * When `filterMaterial` is provided:
   * - An offscreen `WebGLRenderTarget` is created with the given width/height.
   * - The filter material's `tDiffuse` is set to the render target's texture (the fully rendered scene of windows)
   *
   * @param name - The name of the filter
   * @param renderer - WebGL renderer used to perform rendering.
   * @param screenWidth - Width to use for the offscreen render target and screen plane.
   * @param screenHeight - Height to use for the offscreen render target and screen plane.
   * @param filterMaterial - Optional filter material; when omitted the filter pass is disabled.
   */
  constructor(name: string, renderer: THREE.WebGLRenderer, screenWidth: number, screenHeight: number, filterMaterial?: WebXFilterMaterial) {
    this._name = name;
    this._renderer = renderer;
    this._filterMaterial = filterMaterial;

    if (filterMaterial) {
      this._sceneScreen = new THREE.Scene();
      this._rtTexture = new THREE.WebGLRenderTarget(screenWidth, screenHeight);
      this._filterMaterial.tDiffuse = this._rtTexture.texture;

      const plane = new THREE.PlaneGeometry(screenWidth, screenHeight);

      const mesh = new THREE.Mesh(plane, this._filterMaterial);
      // Flip the plane vertically so the offscreen texture appears with correct orientation.
      mesh.rotateX(Math.PI);
      // Position the plane to cover the screen in the filter scene.
      mesh.position.set(0.5 * screenWidth, 0.5 * screenHeight, 10);

      this._sceneScreen.add(mesh);
    }
  }

  /**
   * Render the scene with optional post-processing filter. If the scene is dirty then all the webx windows
   * are redrawn. The rendering is done on the render texture if present or the default framebuffer otherwise.
   * When filtering is enabled, the sceneScreen is present and the full scene is rendered using the
   * filter post-processing shader to the WebGL canvas.
   *
   * @param scene - The main scene to render into the offscreen target.
   * @param camera - Camera used for both the main render and the filter pass.
   * @param isSceneDirty - When true the main scene will be re-rendered.
   */
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

  /**
   * Disposes of WebGL elements
   */
  dispose() {
    this._filterMaterial.dispose();
    this._rtTexture.dispose();
  }
}
