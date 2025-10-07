import {Camera, Color, ColorRepresentation, Mesh, Object3D, Texture, Vector2} from 'three';
import {WebXWindowCanvas} from './WebXWindowCanvas';
import {WebXImageBlender} from './WebXImageBlender';
import {Blob} from "buffer";

/**
 * The `WebXCanvasRenderer` class is responsible for rendering a desktop-like environment
 * using HTML elements. It integrates with the Three.js library using 3D objects (meshes, materials, textures)
 * to hold the graphical data used to render the windows.
 */
export class WebXCanvasRenderer {

  private _width: number;
  private _height: number;
  private _desktopContainer: HTMLElement;
  private _desktop: HTMLElement;
  private _clearColor: Color = new Color(0, 0, 0);
  private readonly _imageBlender: WebXImageBlender;

  private _windowCanvases: Map<number, WebXWindowCanvas> = new Map();

  /**
   * Gets the root DOM element of the renderer.
   * @returns The root DOM element.
   */
  get domElement(): HTMLElement {
    return this._desktopContainer;
  }

  /**
   * Initializes the `WebXCanvasRenderer` by creating the main desktop container
   * and initializing the alpha stencil blender.
   */
  constructor() {
    this.createMainElement();
    this._imageBlender = new WebXImageBlender();
  }

  /**
   * Sets the size of the desktop container.
   * @param width - The width of the desktop in pixels.
   * @param height - The height of the desktop in pixels.
   * @param unused - An optional unused parameter.
   */
  public setSize(width: number, height: number, unused?: boolean) {
    this._width = width;
    this._height = height;
    this._desktop.style.width = `${width}px`;
    this._desktop.style.height = `${height}px`;
  }

  /**
   * Sets the background color of the desktop.
   * @param color - The color to set, represented as a `ColorRepresentation`.
   */
  public setClearColor(color: ColorRepresentation) {
    this._clearColor.set(color);
    this._desktop.style.backgroundColor = `#${this._clearColor.getHexString()}`;
  }

  /**
   * Renders the scene: updates the window element positions, sizes and z-orders and updates
   * the graphical content of the windows. Any windows that are no longer in the scene have their
   * graphical elements removed from the dom.
   * @param scene - The root `Object3D` containing the scene to render.
   * @param camera - The `Camera` used for rendering (currently unused).
   */
  public render(scene: Object3D, camera: Camera) {
    if (scene.children.length > 0) {
      const screen = scene.children[0];
      const activeWindowIds = new Set();

      for (const object of screen.children) {
        if (object instanceof Mesh && object.visible) {
          if (!this._windowCanvases.has(object.id)) {
            this.createWindowCanvas(object);
          }
          const windowCanvas = this._windowCanvases.get(object.id);
          windowCanvas.updateGeometry();
          windowCanvas.updateCanvas();

          activeWindowIds.add(object.id);
        }
      }

      // Remove defunct windows
      for (const [windowId, windowCanvas] of this._windowCanvases.entries()) {
        if (!activeWindowIds.has(windowId)) {
          this.removeWindowCanvas(windowCanvas);
        }
      }

    } else if (this._windowCanvases.size > 0) {
      // Remove all windows
      for (const [_, windowCanvas] of this._windowCanvases.entries()) {
        this.removeWindowCanvas(windowCanvas);
      }
    }
  }

  /**
   * Generates a screenshot of the current windows. Each window canvas is rendered onto a global
   * desktop canvas. The main canvas is then converted into a blob with the specified image type and quality
   * @param type The type of the screenshot (e.g., 'image/png').
   * @param quality The quality of the screenshot (0 to 1).
   */
  public createScreenshot(type: string, quality: number): Promise<Blob> {
    return new Promise<Blob>((resolve, reject) => {
      try {
        const screenshotCanvas = this.createElementNS('canvas') as HTMLCanvasElement;
        screenshotCanvas.width = this._width;
        screenshotCanvas.height = this._height;
        const context = screenshotCanvas.getContext('2d');

        // Ensure that the background is set correctly
        context.fillStyle = `#${this._clearColor.getHexString()}`;
        context.fillRect(0, 0, this._width, this._height);

        // Painters algorithm: Order the windows from back to front and draw the window canvas into the screenshot
        Array.from(this._windowCanvases.values()).sort((a, b) => a.zIndex - b.zIndex).forEach(window => {
          context.drawImage(window.canvas, window.x, window.y);
        })

        // Convert to specified image type and return the blob
        screenshotCanvas.toBlob((blob: Blob) => {
          resolve(blob);
        }, type, quality)

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disposes of the renderer by removing all window canvases and terminating
   * the alpha stencil blender (and its web worker if present).
   */
  public dispose() {
    // Remove all windows
    for (const [_, windowCanvas] of this._windowCanvases.entries()) {
      this.removeWindowCanvas(windowCanvas);
    }

    // Terminate the blended web worker if present
    this._imageBlender.terminate();
  }

  /**
   * Updates a specific region of a window canvas from the color and alpha data sent from the server. The updates are stored in the window
   * and handled at the next render request.
   * @param meshId - The ID of the mesh associated with the window canvas.
   * @param srcColorMap - The source color texture.
   * @param dstColorMap - The destination color texture.
   * @param srcAlphaMap - The source alpha texture.
   * @param dstAlphaMap - The destination alpha texture.
   * @param width - The width of the region to update.
   * @param height - The height of the region to update.
   * @param dstPosition - The destination position of the region.
   */
  public updateWindowRegion(meshId: number, srcColorMap: Texture, dstColorMap: Texture, srcAlphaMap: Texture, dstAlphaMap: Texture, width: number, height: number, dstPosition: Vector2) {
    const windowCanvas = this._windowCanvases.get(meshId);
    if (windowCanvas) {
      windowCanvas.addRegionUpdate(srcColorMap, dstColorMap, srcAlphaMap, dstAlphaMap, width, height, dstPosition);
    }
  }

  /**
   * Creates the main desktop container element and initializes its styles.
   */
  private createMainElement() {
    const desktopContainer = this.createElementNS('div');
    desktopContainer.id = 'webx-desktop-container';
    desktopContainer.style.display = 'block';
    desktopContainer.style.position = 'relative';
    desktopContainer.style.overflow = 'hidden';

    const desktop = document.createElement('div');
    desktop.id = 'webx-desktop';
    desktopContainer.style.position = 'absolute';
    desktopContainer.style.transformOrigin = 'top left';
    desktopContainer.appendChild(desktop);

    this._desktopContainer = desktopContainer;
    this._desktop = desktop;
  }

  /**
   * Creates a new window canvas for the given mesh and adds it to the desktop.
   * @param mesh - The `Mesh` object representing the window.
   */
  private createWindowCanvas(mesh: Mesh) {
    const windowCanvas = new WebXWindowCanvas(mesh, this._imageBlender);
    this._desktop.appendChild(windowCanvas.canvas);
    this._windowCanvases.set(mesh.id, windowCanvas);
  }

  /**
   * Removes a window canvas from the desktop and cleans up its resources.
   * @param windowCanvas - The `WebXWindowCanvas` to remove.
   */
  private removeWindowCanvas(windowCanvas: WebXWindowCanvas) {
    this._desktop.removeChild(windowCanvas.canvas);
    this._windowCanvases.delete(windowCanvas.id);
  }

  /**
   * Creates an HTML element with the specified namespace.
   * @param name - The name of the element to create.
   * @returns The created `HTMLElement`.
   */
  private createElementNS(name: string): HTMLElement {
    return document.createElementNS('http://www.w3.org/1999/xhtml', name);
  }
}
