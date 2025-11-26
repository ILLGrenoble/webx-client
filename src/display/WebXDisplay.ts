import * as THREE from 'three';
import {Color, LinearSRGBColorSpace, OrthographicCamera, Vector2, Vector3, WebGLRenderer} from 'three';
import { WebXWindow } from './WebXWindow';
import { WebXSubImage, WebXWindowProperties } from '../common';
import { WebXCursor } from './WebXCursor';
import { WebXCursorFactory } from './WebXCursorFactory';
import {WebXCanvasRenderer} from '../renderer';
import {WebXDisplayOverlay} from "./WebXDisplayOverlay";
import {WebXWindowImageFactory} from "./WebXWindowImageFactory";
import {toThreeTexture, WebXTexture} from "../texture";
import {WebXMessage} from "../message";
import {
  WebXCRTFilterMaterial,
  WebXFilter,
  WebXFilterFactory,
  WebXFilterMaterial,
  WebXTestFilterMaterial
} from "./filter";

type WebGLInfo = {
  available: boolean;
  vendor?: string;
  renderer?: string;
  isSoftware?: boolean;
};

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
  private readonly _renderer: THREE.WebGLRenderer | WebXCanvasRenderer;
  private readonly _filter: WebXFilter;
  private readonly _screen: THREE.Object3D;
  private readonly _isWebGL: boolean = true;

  private readonly _screenWidth: number;
  private readonly _screenHeight: number;

  private readonly _windowImageFactory: WebXWindowImageFactory;

  private readonly _containerElement: HTMLElement;

  private _windows: WebXWindow[] = [];

  private _cursor: WebXCursor;

  private _scale: number = 1;

  private _displayElement: HTMLElement;

  private _boundsElement: HTMLElement;

  private _displayOverlay: WebXDisplayOverlay;

  private _disposed = false;

  private _sceneDirty = false;

  private _disableStencil = false;

  /**
   * Gets the WebGL renderer used for rendering the display.
   *
   * @returns The WebGLRenderer instance.
   */
  public get renderer(): THREE.WebGLRenderer | WebXCanvasRenderer {
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
   * Returns when the scene is dirty and needs to be re-rendered.
   * @return true if the scene is dirty, false otherwise
   */
  get sceneDirty(): boolean {
    return this._sceneDirty;
  }

  /**
   * Explicitly sets the scene dirty flag to indicate that the scene needs to be re-rendered.
   * @param value the scene dirty value
   */
  set sceneDirty(value: boolean) {
    this._sceneDirty = value;
  }

  /**
   * Creates a new instance of WebXDisplay.
   *
   * @param containerElement The HTML element to render the display.
   * @param screenWidth The width of the screen.
   * @param screenHeight The height of the screen.
   * @param windowImageFactory The factory used for obtaining window images.
   * @param cursorFactory The cursor factory used for managing cursors.
   */
  constructor(containerElement: HTMLElement, screenWidth: number, screenHeight: number, windowImageFactory: WebXWindowImageFactory, cursorFactory: WebXCursorFactory) {
    this._containerElement = containerElement;
    this._screenWidth = screenWidth;
    this._screenHeight = screenHeight;
    this._windowImageFactory = windowImageFactory;
    this._cursor = new WebXCursor(cursorFactory);
    this._displayOverlay = new WebXDisplayOverlay(this._cursor);

    this._scene = new THREE.Scene();
    this._screen = new THREE.Object3D();

    // Add dummy mesh to the scene otherwise the texture updates don't appear to have the correct state and aren't applied correctly
    const dummy = new THREE.Mesh(
      new THREE.PlaneGeometry(1.0, 1.0, 2, 2),
      new THREE.MeshBasicMaterial({ map: new THREE.DataTexture(new Uint8ClampedArray(4), 1, 1), side: THREE.BackSide, transparent: true }));
    dummy.position.set(0, 0, 999);
    this._screen.add(dummy);

    this._camera = new THREE.OrthographicCamera(0, screenWidth, 0, screenHeight, 0.1, 10000);
    this._camera.position.z = 1000;
    this._camera.lookAt(new Vector3(0, 0, 0));

    const backgroundColor = new Color().setStyle(window.getComputedStyle(this._containerElement).backgroundColor, LinearSRGBColorSpace);

    const webglInfo = this._detectWebGL2();
    const url = new URL(window.location.href);
    const params = url.searchParams;
    const forceCanvas = params.get("webx-canvas") === 'true';
    this._disableStencil = params.get("webx-stencil") === 'false';
    const filterName = params.get("webx-filter");

    this._isWebGL = webglInfo.available && !webglInfo.isSoftware && !forceCanvas;
    if (this._isWebGL) {
      this._renderer = new THREE.WebGLRenderer();
      if (filterName) {
        this._filter = WebXFilterFactory.Build(this._renderer, screenWidth, screenHeight, filterName, {backgroundColor});
      }

    } else {
      console.log(`WebGL2 Info: available = ${webglInfo.available}, isSoftware = ${webglInfo.isSoftware}, vendor = ${webglInfo.vendor}, renderer = ${webglInfo.renderer}`);
      if (forceCanvas) {
        console.log(`Canvas Renderer enabled through request param`);

      } else {
        console.log(`Falling back to Canvas Renderer`);
      }
      this._renderer = new WebXCanvasRenderer();
      WebXMessage.convertToImageDataInWorker = true;
    }

    this._renderer.setSize(screenWidth, screenHeight, false);
    this._renderer.setClearColor(backgroundColor);

    this._render();
    this._bindListeners();

    // initial size
    this.resize();
  }

  /**
   * Displays the screen by adding it to the scene.
   */
  showScreen(): void {
    this._scene.add(this._screen);
    this._displayOverlay.visible = true;
    this._sceneDirty = true;
  }

  /**
   * Hides the screen by removing it from the scene.
   */
  hideScreen(): void {
    this._scene.remove(this._screen);
    this._displayOverlay.visible = false;
    this._sceneDirty = true;
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

      this._displayOverlay.update();

      this.render();
    }
  }

  /**
   * Renders the display by updating the WebGL context.
   */
  render(): void {
    if (this._filter) {
      this._filter.render(this._scene, this._camera, this._sceneDirty);

    } else if (this._sceneDirty) {
      this._renderer.render(this._scene, this._camera);
    }
    this._sceneDirty = false;
  }

  /**
   * Creates a screenshot of the current desktop with the specified image type and quality
   * @param type The type of the screenshot (e.g., 'image/png').
   * @param quality The quality of the screenshot (0 to 1).
   */
  async createScreenshot(type: string, quality: number): Promise<Blob> {
    if (this._renderer instanceof WebXCanvasRenderer) {
      return this._renderer.createScreenshot(type, quality);

    } else {
      const renderer = this._renderer as THREE.WebGLRenderer;
      return new Promise<Blob>((resolve, reject) => {
        try {
          this.render();
          renderer.domElement.toBlob((blob: Blob) => {
            resolve(blob);
          }, type, quality)

        } catch (error) {
          reject(error);
        }
      });
    }
  }

  /**
   * Adds a new window to the display.
   *
   * @param window The WebXWindow instance to add.
   */
  addWindow(window: WebXWindow): void {
    if (this._windows.find(existingWindow => existingWindow.id === window.id) == null) {
      this._windows.push(window);
      this._screen.add(window.mesh);
      this._sceneDirty = true;
    }
  }

  /**
   * Removes a window from the display.
   *
   * @param window The WebXWindow instance to remove.
   */
  removeWindow(window: WebXWindow): void {
    if (this._windows.find(existingWindow => existingWindow.id === window.id) != null) {
      this._windows = this._windows.filter(existingWindow => existingWindow.id !== window.id);
      window.dispose();
      this._screen.remove(window.mesh);
      this._sceneDirty = true;
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
            shaped: window.shaped && !this._disableStencil,
          }, this._windowImageFactory);

          this.addWindow(webXWindow);

          webXWindow.loadWindowImageAndShape()
            .then(() => {
              // When all windows have been loaded then callback. This is only really needed for the startup
              if (this.checkAllLoaded(windows.map(window => window.id))) {
                resolve();
              }
            })

        } else {
          // Update window
          webXWindow.shaped = window.shaped && !this._disableStencil;
          webXWindow.setRectangle(window.x, window.y, index, window.width, window.height);
        }
      });

      if (!hasNewWindows) {
        resolve();
      }
    })
  }

  /**
   * Checks if all specified windows have been loaded.
   *
   * @param windowIds The list of window IDs to check.
   * @returns True if all windows are loaded, false otherwise.
   */
  checkAllLoaded(windowIds: number[]): boolean {
    const allLoaded = windowIds
      .map(id => this.getWindow(id))
      .filter(window => window != null)
      .map(window => window.loaded)
      .reduce((allLoaded, loaded) => allLoaded && loaded, true);

    return allLoaded;
  }

  /**
   * Updates the texture of a window with new image data.
   *
   * @param windowId The ID of the window to update.
   * @param depth The depth of the image.
   * @param colorMap The color texture.
   * @param alphaMap The alpha texture.
   */
  updateImage(windowId: number, depth: number, colorMap: WebXTexture, alphaMap: WebXTexture): void {
    const window: WebXWindow = this.getWindow(windowId);
    if (window != null && !(colorMap == null && alphaMap == null)) {
      window.updateTexture(depth, toThreeTexture(colorMap), toThreeTexture(alphaMap), true);
      this._sceneDirty = true;
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
        if (this._renderer instanceof WebXCanvasRenderer) {
          this._renderer.updateWindowRegion(window.mesh.id, toThreeTexture(subImage.colorMap), colorMap, toThreeTexture(subImage.alphaMap), alphaMap, subImage.width, subImage.height, new THREE.Vector2(subImage.x, subImage.y));

        } else {
          if (colorMap && subImage.colorMap) {
            this._renderer.copyTextureToTexture(toThreeTexture(subImage.colorMap), colorMap, null, new THREE.Vector2(subImage.x, subImage.y));
          }
          if (alphaMap && subImage.alphaMap) {
            this._renderer.copyTextureToTexture(toThreeTexture(subImage.alphaMap), alphaMap, null, new THREE.Vector2(subImage.x, subImage.y));
          }
        }

      }
      window.updateTexture(window.depth, colorMap, alphaMap, false);
      this._sceneDirty = true;
    }
  }

  /**
   * Updates the texture of a window stencil map with.
   *
   * @param windowId The ID of the window to update.
   * @param stencilMap The stencil texture.
   */
  updateShape(windowId: number, stencilMap: WebXTexture): void {
    if (this._disableStencil) {
      return;
    }
    const window: WebXWindow = this.getWindow(windowId);
    if (window != null && stencilMap != null) {
      window.updateStencilTexture(toThreeTexture(stencilMap));
      this._sceneDirty = true;
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
    this._sceneDirty = true;
  }

  /**
   * Automatically scales the display to fit its container.
   */
  autoScale(): void {
    const container = this._containerElement;
    const { clientWidth, clientHeight } = container;
    const { screenWidth, screenHeight } = this;
    this._scale = Math.min(clientWidth / screenWidth, clientHeight / screenHeight);
    this._sceneDirty = true;
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

    element.appendChild(this._displayOverlay.overlayElement);

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

  /**
   * Returns details about the availability and type of WebGL2 rendering
   */
  private _detectWebGL2(): WebGLInfo {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) {
      return { available: false };
    }

    const renderer = gl.getParameter(gl.RENDERER);
    const vendor = gl.getParameter(gl.VENDOR);
    let unmaskedRenderer: string  = null;
    let unmaskedVendor: string = null;

    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (ext) {
      unmaskedRenderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
      unmaskedVendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL);
    }

    const rendererStr = (unmaskedRenderer || renderer || "").toLowerCase();
    const isSoftware = /swiftshader|llvmpipe|basic render|software/i.test(rendererStr);

    return { available: true, vendor: unmaskedVendor || vendor, renderer: unmaskedRenderer || renderer, isSoftware };
  }
}
