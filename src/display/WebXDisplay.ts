import * as THREE from 'three';
import {OrthographicCamera, Texture, Vector3} from 'three';
import { WebXWindow } from './WebXWindow';
import { WebXWindowProperties } from './WebXWindowProperties';
import { WebXSubImage } from './WebXSubImage';
import { WebXCursor } from './WebXCursor';
import { WebXTextureFactory } from './WebXTextureFactory';
import { WebXCursorFactory } from './WebXCursorFactory';

/**
 * Manages the rendering of the WebX remote desktop using WebGL.
 *
 * This class handles the creation and management of the WebGL scene, including
 * windows, cursor, and scaling. It provides methods to update the display
 * and interact with the rendered elements.
 */
export class WebXDisplay {

  private readonly _scene: THREE.Scene;
  private readonly _camera: THREE.OrthographicCamera;
  private readonly _renderer: THREE.WebGLRenderer;
  private readonly _screen: THREE.Object3D;

  private readonly _screenWidth: number;
  private readonly _screenHeight: number;

  private readonly _textureFactory: WebXTextureFactory;

  private readonly _containerElement: HTMLElement;

  private _windows: WebXWindow[] = [];

  private _cursor: WebXCursor;

  private _scale: number = 1;

  private _displayElement: HTMLElement;

  private _boundsElement: HTMLElement;

  private _disposed = false;

  /**
   * Gets the WebGL renderer used for rendering the display.
   *
   * @returns The WebGLRenderer instance.
   */
  public get renderer(): THREE.WebGLRenderer {
    return this._renderer;
  }

  /**
   * Gets the width of the screen.
   *
   * @returns The screen width in pixels.
   */
  public get screenWidth(): number {
    return this._screenWidth;
  }

  /**
   * Gets the height of the screen.
   *
   * @returns The screen height in pixels.
   */
  public get screenHeight(): number {
    return this._screenHeight;
  }

  /**
   * Gets the HTML container element for the display.
   *
   * @returns The container HTMLElement.
   */
  public get containerElement(): HTMLElement {
    return this._containerElement;
  }

  /**
   * Gets the current scale factor of the display.
   *
   * @returns The scale factor as a number.
   */
  public get scale(): number {
    return this._scale;
  }

  /**
   * Gets the Three.js scene used for rendering.
   *
   * @returns The Scene instance.
   */
  public get scene(): THREE.Scene {
    return this._scene;
  }

  /**
   * Gets the Three.js camera used for rendering.
   *
   * @returns the Camera instance
   */
  get camera(): OrthographicCamera {
    return this._camera;
  }

  /**
   * Creates a new instance of WebXDisplay.
   *
   * @param containerElement The HTML element to render the display.
   * @param screenWidth The width of the screen.
   * @param screenHeight The height of the screen.
   * @param textureFactory The texture factory used for creating textures.
   * @param cursorFactory The cursor factory used for managing cursors.
   */
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

    this._renderer = new THREE.WebGLRenderer();
    this._renderer.setSize(screenWidth, screenHeight, false);

    const backgroundColor = window.getComputedStyle(this._containerElement).backgroundColor;
    this._renderer.setClearColor(backgroundColor);

    this._render();
    this._bindListeners();

    // initial size
    this.resize();

    this._renderer.render(this._scene, this._camera);
  }

  /**
   * Displays the screen by adding it to the scene.
   */
  showScreen(): void {
    this._scene.add(this._screen);
  }

  /**
   * Hides the screen by removing it from the scene.
   */
  hideScreen(): void {
    this._scene.remove(this._screen);
  }

  /**
   * Disposes of all resources used by the display.
   *
   * This includes removing windows, clearing elements, and releasing WebGL resources.
   */
  dispose(): void {
    this.hideScreen();

    for (const window of this._windows) {
      this._screen.remove(window.mesh);
      window.dispose();
    }

    this._cursor.dispose();

    this._clearElements();

    this._renderer.dispose();

    this._disposed = true;
  }

  /**
   * Animates the display by continuously rendering the scene.
   *
   * This method uses `requestAnimationFrame` to update the display at regular intervals.
   */
  animate(): void {
    if (!this._disposed) {
      requestAnimationFrame(() => {
        this.animate();
      });

      this.render();
    }
  }

  /**
   * Renders the display by updating the WebGL context.
   */
  render(): void {
    this._renderer.render(this._scene, this._camera);
  }

  /**
   * Adds a new window to the display.
   *
   * @param window The WebXWindow instance to add.
   */
  addWindow(window: WebXWindow): void {
    if (this._windows.find(existingWindow => existingWindow.id === window.id) == null) {
      // console.log("Adding window ", window.id)
      this._windows.push(window);
      this._screen.add(window.mesh);
    }
  }

  /**
   * Removes a window from the display.
   *
   * @param window The WebXWindow instance to remove.
   */
  removeWindow(window: WebXWindow): void {
    if (this._windows.find(existingWindow => existingWindow.id === window.id) != null) {
      // console.log("Removing window ", window.id)
      this._windows = this._windows.filter(existingWindow => existingWindow.id !== window.id);
      window.dispose();
      this._screen.remove(window.mesh);
    }
  }

  /**
   * Updates the display with the given windows.
   *
   * @param windows The list of windows to update.
   * @returns A promise that resolves when all windows are updated.
   */
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
            height: window.height,
            shaped: window.shaped,
          }, this._textureFactory);

          this.addWindow(webXWindow);

          webXWindow.loadWindowImageAndShape()
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

  /**
   * Checks if all specified windows are visible.
   *
   * @param windowIds The list of window IDs to check.
   * @returns True if all windows are visible, false otherwise.
   */
  checkVisibility(windowIds: number[]): boolean {
    const allVisible = windowIds
      .map(id => this.getWindow(id))
      .filter(window => window != null)
      .map(window => window.visible)
      .reduce((allVisible, visible) => allVisible && visible, true);

    return allVisible;
  }

  /**
   * Updates the texture of a window with new image data.
   *
   * @param windowId The ID of the window to update.
   * @param depth The depth of the image.
   * @param colorMap The color texture.
   * @param alphaMap The alpha texture.
   */
  updateImage(windowId: number, depth: number, colorMap: Texture, alphaMap: Texture): void {
    const window: WebXWindow = this.getWindow(windowId);
    if (window != null && !(colorMap == null && alphaMap == null)) {
      window.updateTexture(depth, colorMap, alphaMap, true);
    }
  }

  /**
   * Updates sub-images of a window with new image data.
   *
   * @param windowId The ID of the window to update.
   * @param subImages The list of sub-images to update.
   */
  updateSubImages(windowId: number, subImages: WebXSubImage[]): void {
    const window: WebXWindow = this.getWindow(windowId);
    if (window != null && window.colorMapValid) {
      const colorMap = window.colorMap;
      const alphaMap = window.alphaMap;
      for(let i= 0; i< subImages.length; i++) {
        const subImage = subImages[i];
        if (colorMap && subImage.colorMap) {
          this._renderer.copyTextureToTexture(subImage.colorMap, colorMap, null, new THREE.Vector2(subImage.x, subImage.y));
        }
        if (alphaMap && subImage.alphaMap) {
          this._renderer.copyTextureToTexture(subImage.alphaMap, alphaMap, null, new THREE.Vector2(subImage.x, subImage.y));
        }
      }
      window.updateTexture(window.depth, colorMap, alphaMap, false);
    }
  }

  /**
   * Updates the texture of a window stencil map with.
   *
   * @param windowId The ID of the window to update.
   * @param stencilMap The stencil texture.
   */
  updateShape(windowId: number, stencilMap: Texture): void {
    const window: WebXWindow = this.getWindow(windowId);
    if (window != null && stencilMap != null) {
      window.updateStencilTexture(stencilMap);
    }
  }

  /**
   * Updates the mouse cursor on the display.
   *
   * @param cursorId The ID of the cursor to display.
   */
  setMouseCursor(cursorId: number): void {
    this._cursor.setCursorId(cursorId);
  }

  /**
   * Updates the mouse position without changing the cursor.
   *
   * @param x The x-coordinate of the mouse.
   * @param y The y-coordinate of the mouse.
   */
  setMousePosition(x: number, y: number): void {
    this._cursor.setPosition(x, y);
  }

  /**
   * Retrieves a window by its ID.
   *
   * @param id The ID of the window to retrieve.
   * @returns The WebXWindow instance, or undefined if not found.
   */
  getWindow(id: number): WebXWindow {
    return this._windows.find(window => window.id === id);
  }

  /**
   * Sets the scale of the display.
   *
   * @param scale The scale factor (between 0 and 1).
   */
  setScale(scale: number): void {
    this._scale = scale;
  }

  /**
   * Automatically scales the display to fit its container.
   */
  autoScale(): void {
    const container = this._containerElement;
    const { clientWidth, clientHeight } = container;
    const { screenWidth, screenHeight } = this;
    this._scale = Math.min(clientWidth / screenWidth, clientHeight / screenHeight);
  }

  /**
   * Resizes the display to fit its container.
   *
   * @param scale Optional scale factor. If not provided, the display will auto-scale.
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

  /**
   * Clears all child elements from the container element.
   */
  private _clearElements(): void {
    while (this._containerElement.firstChild) {
      this._containerElement.removeChild(this._containerElement.firstChild);
    }
  }

  /**
   * Creates the main display element and sets its dimensions.
   *
   * @returns The created HTML element.
   */
  private _createDisplayElement(): HTMLElement {
    const element = document.createElement('div');
    element.style.width = `${this._screenWidth}px`;
    element.style.height = `${this._screenHeight}px`;
    element.appendChild(this._renderer.domElement);
    return element;
  }

  /**
   * Creates the bounding element for the display.
   *
   * @returns The created HTML element.
   */
  private _createDisplayBoundingElement(): HTMLElement {
    const element = document.createElement('div');
    element.appendChild(this._displayElement);
    return element;
  }

  /**
   * Renders the display by appending the display and bounding elements to the container.
   */
  private _render(): void {
    this._clearElements();
    this._displayElement = this._createDisplayElement();
    this._boundsElement = this._createDisplayBoundingElement();
    this._containerElement.appendChild(this._boundsElement);
  }

  /**
   * Binds event listeners for resizing and other interactions.
   */
  private _bindListeners(): void {
    this.resize = this.resize.bind(this);
  }
}
