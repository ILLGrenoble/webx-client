import * as THREE from 'three';
import { Texture } from 'three';
import { Vector3 } from 'three';
import { WebXWindow } from './WebXWindow';
import { WebXWindowProperties } from './WebXWindowProperties';
import { WebXSubImage } from './WebXSubImage';
import { WebXWebGLRenderer } from '../utils/WebXWebGLRenderer';
import { WebXCursor } from './WebXCursor';
import * as TWEEN from "@tweenjs/tween.js";

export class WebXDisplay {

  private _scene: THREE.Scene;
  private _camera: THREE.OrthographicCamera;
  private _renderer: WebXWebGLRenderer;

  private _screenWidth = 10;
  private _screenHeight = 10;

  private _windows: WebXWindow[] = [];
  private _cursor: WebXCursor = new WebXCursor();

  private _scale: number = 1;

  private _containerElement: HTMLElement;

  private _displayElement: HTMLElement;

  private _boundsElement: HTMLElement;

  public get renderer(): THREE.WebGLRenderer {
    return this._renderer;
  }

  public get screenWidth(): number {
    return this._screenWidth;
  }

  public get screenHeight(): number {
    return this._screenHeight;
  }

  public get containerElement(): HTMLElement {
    return this._containerElement;
  }

  public get scale(): number {
    return this._scale;
  }

  public get scene(): THREE.Scene {
    return this._scene;
  }

  constructor(containerElement: HTMLElement, screenWidth: number, screenHeight: number) {
    this._containerElement = containerElement;
    this._screenWidth = screenWidth;
    this._screenHeight = screenHeight;

    this._scene = new THREE.Scene();

    this._scene.add(this._cursor.mesh);

    // this._camera = new THREE.OrthographicCamera(0, screenWidth, 0, screenHeight, 0.1, 100);
    this._camera = new THREE.OrthographicCamera(0, screenWidth, 0, screenHeight, 0.1, 10000);
    this._camera.position.z = 1000;
    this._camera.lookAt(new Vector3(0, 0, 0));

    this._renderer = new THREE.WebGLRenderer() as WebXWebGLRenderer;
    this._renderer.setSize(screenWidth, screenHeight, false);

    this._render();
    this._bindListeners();

    // initial size
    this.resize();
  }

  private _createDisplayElement(): HTMLElement {
    const element = document.createElement('div');
    element.style.width = `${this._screenWidth}px`;
    element.style.height = `${this._screenHeight}px`;
    element.appendChild(this._renderer.domElement);
    return element;
  }

  private _createDisplayBoundingElement(): HTMLElement {
    const element = document.createElement('div');
    element.appendChild(this._displayElement);
    return element;
  }

  /**
   * Render the display to the screen
   */
  private _render(): void {
    this._displayElement = this._createDisplayElement();
    this._boundsElement = this._createDisplayBoundingElement();
    this._containerElement.appendChild(this._boundsElement);
  }

  /**
   * Bind the event listeners
   */
  private _bindListeners(): void {
    this.resize = this.resize.bind(this);
  }

  animate(): void {
    requestAnimationFrame((time) => {
      this.animate();
      TWEEN.update(time);
    });
    this._renderer.render(this._scene, this._camera);
  }

  addWindow(window: WebXWindow): void {
    if (this._windows.find(existingWindow => existingWindow.id === window.id) == null) {
      // console.log("Adding window ", window.id)
      this._windows.push(window);
      this._scene.add(window.mesh);
    }
  }

  removeWindow(window: WebXWindow): void {
    if (this._windows.find(existingWindow => existingWindow.id === window.id) != null) {
      // console.log("Removing window ", window.id)
      this._windows = this._windows.filter(existingWindow => existingWindow.id !== window.id);
      this._scene.remove(window.mesh);
    }
  }

  updateWindows(windows: Array<WebXWindowProperties>): void {
    // Get windows to remove
    const deadWindows = this._windows.filter(existingWindow => windows.find(window => window.id === existingWindow.id) == null);

    // Remove windows that no longer exist
    deadWindows.forEach(deadWindow => this.removeWindow(deadWindow));

    // Update and add windows
    windows.forEach((window, index) => {
      let webXWindow = this.getWindow(window.id);
      if (webXWindow == null) {
        // Add a new window
        webXWindow = new WebXWindow({
          id: window.id,
          x: window.x,
          y: window.y,
          z: index,
          width: window.width,
          height: window.height
        });

        this.addWindow(webXWindow);

      } else {
        // Update window
        webXWindow.setRectangle(window.x, window.y, index, window.width, window.height);
      }
    });
  }

  updateImage(windowId: number, depth: number, texture: Texture): void {
    const window: WebXWindow = this.getWindow(windowId);
    if (window != null && texture != null) {
      window.updateTexture(depth, texture);
    }
  }

  updateSubImages(windowId: number, subImages: WebXSubImage[]): void {
    const window: WebXWindow = this.getWindow(windowId);
    if (window != null && window.textureValid) {
      const windowTexture = window.texture;
      if (windowTexture != null) {
        subImages.forEach(subImage => {
          this._renderer.copyTextureToTexture(new THREE.Vector2(subImage.x, subImage.y), subImage.texture, windowTexture);
        });
        window.updateTexture(window.depth, windowTexture);
      }
    }
  }

  updateMouse(x: number, y: number, cursorId: number) {
    this._cursor.updateCursorId(x, y, cursorId);
  }

  updateMousePosition(x: number, y: number) {
    this._cursor.setPosition(x, y);
  }

  getWindow(id: number): WebXWindow {
    return this._windows.find(window => window.id === id);
  }

  /**
   * Set the scale
   * @param scale the scale (between 0 and 1)
   */
  setScale(scale: number) {
    this._scale = scale;
  }

  /**
   * Scale automatically
   */
  autoScale() {
    const container = this._containerElement;
    const { clientWidth, clientHeight } = container;
    const { screenWidth, screenHeight } = this;
    this._scale = Math.min(clientWidth / screenWidth, clientHeight / screenHeight);
  }

  /**
   * Update the screen scale
   * @param scale between 0 and 1 or empty. If empty then the display will autoscale
   *              to fit the dimensions of its container
   */
  resize(scale?: number): void {
    const element = this._boundsElement;
    if (scale) {
      this.setScale(scale);
    } else {
      this.autoScale();
    }
    element.style.transform = `scale(${this._scale},${this._scale})`;
  }
}