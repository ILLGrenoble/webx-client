import {Camera, Color, ColorRepresentation, Mesh, Object3D, Texture, Vector2} from 'three';
import {WebXWindowCanvas} from './WebXWindowCanvas';
import {WebXAlphaBlender} from './WebXAlphaBlender';

export class WebXCanvasRenderer {

  private _desktopContainer: HTMLElement;
  private _desktop: HTMLElement;
  private _clearColor: Color = new Color( 0, 0, 0);
  private readonly _alphaBlender: WebXAlphaBlender;

  private _windowCanvases: Map<number, WebXWindowCanvas> = new Map();

  get domElement(): HTMLElement {
    return this._desktopContainer;
  }

  constructor() {
    this.createMainElement();
    this._alphaBlender = new WebXAlphaBlender();
  }

  public setSize(width: number, height: number, unused?: boolean) {
    this._desktop.style.width = `${width}px`;
    this._desktop.style.height = `${height}px`;
  }

  public setClearColor(color: ColorRepresentation) {
    this._clearColor.set(color);
    this._desktop.style.backgroundColor = `#${this._clearColor.getHexString()}`;
  }

  public render(scene: Object3D, camera: Camera) {
    // Check if the screen has been added to the scene
    if (scene.children.length > 0) {
      const screen = scene.children[0];

      const activeWindowIds = new Set();

      // Update visible windows
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
          this.removeWindowCanvas(windowCanvas)
        }
      }

    } else if (this._windowCanvases.size > 0) {
      // Remove all windows
      for (const [_, windowCanvas] of this._windowCanvases.entries()) {
        this.removeWindowCanvas(windowCanvas)
      }
    }
  }

  public dispose() {
    // Remove all windows
    for (const [_, windowCanvas] of this._windowCanvases.entries()) {
      this.removeWindowCanvas(windowCanvas)
    }

    this._alphaBlender.terminate();
  }

  public updateWindowRegion(meshId: number, srcColorMap: Texture, dstColorMap: Texture, srcAlphaMap: Texture, dstAlphaMap: Texture, width: number, height: number, dstPosition: Vector2) {
    const windowCanvas = this._windowCanvases.get(meshId);
    if (windowCanvas) {
      windowCanvas.addRegionUpdate(srcColorMap, dstColorMap, srcAlphaMap, dstAlphaMap, width, height, dstPosition);
    }
  }

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

  private createWindowCanvas(mesh: Mesh) {
    const windowCanvas = new WebXWindowCanvas(mesh, this._alphaBlender);
    this._desktop.appendChild(windowCanvas.element);
    this._windowCanvases.set(mesh.id, windowCanvas);
  }

  private removeWindowCanvas(windowCanvas: WebXWindowCanvas) {
    this._desktop.removeChild(windowCanvas.element);
    this._windowCanvases.delete(windowCanvas.id);
  }

  private createElementNS(name: string): HTMLElement {
    return document.createElementNS('http://www.w3.org/1999/xhtml', name);
  }
}
