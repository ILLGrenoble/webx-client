import * as THREE from 'three';
import { Texture } from 'three';
import { Vector3 } from 'three';
import { WebXWindow } from './WebXWindow';
import { WebXWindowProperties } from './WebXWindowProperties';
import { WebXSubImage } from './WebXSubImage';
import { WebXWebGLRenderer } from '../utils/WebXWebGLRenderer';
import { WebXCursor } from './WebXCursor';
import * as TWEEN from "@tweenjs/tween.js";
import { WebXTextureFactory } from './WebXTextureFactory';
import { WebXCursorFactory } from './WebXCursorFactory';

export class WebXDisplay {

  private readonly _scene: THREE.Scene;
  private readonly _camera: THREE.OrthographicCamera;
  private readonly _renderer: WebXWebGLRenderer;
  private readonly _screen: THREE.Object3D;

  private readonly _screenWidth;
  private readonly _screenHeight;

  private readonly _textureFactory: WebXTextureFactory;

  private readonly _containerElement: HTMLElement;

  private _windows: WebXWindow[] = [];

  private _cursor: WebXCursor;

  private _scale: number = 1;

  private _displayElement: HTMLElement;

  private _boundsElement: HTMLElement;

  private _disposed = false;

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

  constructor(containerElement: HTMLElement, screenWidth: number, screenHeight: number, textureFactory: WebXTextureFactory, cursorFactory: WebXCursorFactory) {
    this._containerElement = containerElement;
    this._screenWidth = screenWidth;
    this._screenHeight = screenHeight;
    this._textureFactory = textureFactory;
    this._cursor = new WebXCursor(cursorFactory);

    this._scene = new THREE.Scene();

    this._screen = new THREE.Object3D();
    // this._scene.add(this._screen);

    this._screen.add(this._cursor.mesh);

    // this._camera = new THREE.OrthographicCamera(0, screenWidth, 0, screenHeight, 0.1, 100);
    this._camera = new THREE.OrthographicCamera(0, screenWidth, 0, screenHeight, 0.1, 10000);
    this._camera.position.z = 1000;
    this._camera.lookAt(new Vector3(0, 0, 0));

    this._renderer = new THREE.WebGLRenderer() as WebXWebGLRenderer;
    this._renderer.setSize(screenWidth, screenHeight, false);

    const backgroundColor = window.getComputedStyle(this._containerElement).backgroundColor;
    this._renderer.setClearColor(backgroundColor);

    this._render();
    this._bindListeners();

    // initial size
    this.resize();

    this._renderer.render(this._scene, this._camera);
  }

  showScreen(): void {
    this._scene.add(this._screen);
  }

  hideScreen(): void {
    this._scene.remove(this._screen);
  }

  dispose(): void {
    this.hideScreen();

    for (const window of this._windows) {
      this._screen.remove(window.mesh);
      window.dispose();
    }

    this._clearElements();

    this._renderer.dispose();

    this._disposed = true;
  }

  animate(): void {
    if (!this._disposed) {
      requestAnimationFrame((time) => {
        this.animate();
        TWEEN.update(time);
      });
      this._handleWindowRefresh(Date.now());

      this._renderer.render(this._scene, this._camera);
    }
  }

  addWindow(window: WebXWindow): void {
    if (this._windows.find(existingWindow => existingWindow.id === window.id) == null) {
      // console.log("Adding window ", window.id)
      this._windows.push(window);
      this._screen.add(window.mesh);
    }
  }

  removeWindow(window: WebXWindow): void {
    if (this._windows.find(existingWindow => existingWindow.id === window.id) != null) {
      // console.log("Removing window ", window.id)
      this._windows = this._windows.filter(existingWindow => existingWindow.id !== window.id);
      this._screen.remove(window.mesh);
    }
  }

  updateWindows(windows: Array<WebXWindowProperties>): Promise<void> {
    return new Promise((resolve) => {
      // Get windows to remove
      const deadWindows = this._windows.filter(existingWindow => windows.find(window => window.id === existingWindow.id) == null);

      // Remove windows that no longer exist
      deadWindows.forEach(deadWindow => this.removeWindow(deadWindow));

      let hasNewWindows = false;
      // Update and add windows
      windows.forEach((window, index) => {
        let webXWindow = this.getWindow(window.id);
        if (webXWindow == null) {
          hasNewWindows = true;

          // Add a new window
          webXWindow = new WebXWindow({
            id: window.id,
            x: window.x,
            y: window.y,
            z: index,
            width: window.width,
            height: window.height
          }, this._textureFactory);

          this.addWindow(webXWindow);

          webXWindow.loadWindowImage()
            .then(() => {
              // When all windows are visible then callback. This is only really needed for the startup
              if (this.checkVisibility(windows.map(window => window.id))) {
                resolve();
              }
            })

        } else {
          // Update window
          webXWindow.setRectangle(window.x, window.y, index, window.width, window.height);
        }
      });

      if (!hasNewWindows) {
        resolve();
      }
    })
  }

  checkVisibility(windowIds: number[]): boolean {
    const allVisible = windowIds
      .map(id => this.getWindow(id))
      .filter(window => window != null)
      .map(window => window.visible)
      .reduce((allVisible, visible) => allVisible && visible, true);

    return allVisible;
  }

  updateImage(windowId: number, depth: number, colorMap: Texture, alphaMap: Texture): void {
    const window: WebXWindow = this.getWindow(windowId);
    if (window != null && !(colorMap == null && alphaMap == null)) {
      window.updateTexture(depth, colorMap, alphaMap, true);
    }
  }

  updateSubImages(windowId: number, subImages: WebXSubImage[]): void {
    const window: WebXWindow = this.getWindow(windowId);
    if (window != null && window.colorMapValid) {
      const colorMap = window.colorMap;
      const alphaMap = window.alphaMap;
      for(let i= 0; i< subImages.length; i++) {
        const subImage = subImages[i];
        if (colorMap && subImage.colorMap) {
          this._renderer.copyTextureToTexture(new THREE.Vector2(subImage.x, subImage.y), subImage.colorMap, colorMap);
        }
        if (alphaMap && subImage.alphaMap) {
          this._renderer.copyTextureToTexture(new THREE.Vector2(subImage.x, subImage.y), subImage.alphaMap, alphaMap);
        }
      }
      window.updateTexture(window.depth, colorMap, alphaMap, false);
    }
  }

  updateMouse(x: number, y: number, cursorId: number): void {
    this._cursor.updateCursorId(x, y, cursorId);
  }

  updateMousePosition(x: number, y: number): void {
    this._cursor.setPosition(x, y);
  }

  getWindow(id: number): WebXWindow {
    return this._windows.find(window => window.id === id);
  }

  /**
   * Set the scale
   * @param scale the scale (between 0 and 1)
   */
  setScale(scale: number): void {
    this._scale = scale;
  }

  /**
   * Scale automatically
   */
  autoScale(): void {
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


  private _clearElements(): void {
    while (this._containerElement.firstChild) {
      this._containerElement.removeChild(this._containerElement.firstChild);
    }
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
    this._clearElements();
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

  private _handleWindowRefresh(now: number) {
    this._windows.forEach((window: WebXWindow) => {
      if (window.lastWindowUpdateTimeMs != null && (now - window.lastWindowUpdateTimeMs) > WebXWindow.WINDOW_REFRESH_TIME_MS) {
        window.lastWindowUpdateTimeMs = null;
        window.loadWindowImage().then();
      }
    });
  }
}
