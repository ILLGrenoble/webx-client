import {Box2, Camera, Color, ColorRepresentation, Object3D, Texture, Vector2} from "three";
import {WebXColorGenerator} from "../utils";

export class WebXCanvasRenderer {

  private _desktopContainer: HTMLElement;
  private _desktop: HTMLElement;
  private _clearColor: Color = new Color( 0, 0, 0);

  private _windowElements: Map<number, HTMLElement> = new Map();

  get domElement(): HTMLElement {
    return this._desktopContainer;
  }

  constructor() {
    this.createMainElement();
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
      for (const windowObject of screen.children) {
        if (!this._windowElements.has(windowObject.id)) {
          this.createWindowElement(windowObject);
        }
        const windowElement = this._windowElements.get(windowObject.id);
        this.updateGeometry(windowElement, windowObject);

        activeWindowIds.add(windowObject.id);
      }

      // Remove defunct windows
      for (const [windowId, element] of this._windowElements.entries()) {
        if (!activeWindowIds.has(windowId)) {
          this.removeWindowElement(windowId, element)
        }
      }

    } else if (this._windowElements.size > 0) {
      // Remove all windows
      for (const [windowId, element] of this._windowElements.entries()) {
        this.removeWindowElement(windowId, element)
      }
    }
  }

  public dispose() {

  }

  public copyTextureToTexture(src: Texture, dst: Texture, srcRegion?: Box2 | null, dstPosition?: Vector2 | null) {

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

  private createWindowElement(object: Object3D) {
    const windowElement = this.createElementNS('div');
    windowElement.id = `webx-window-${object.id}`;
    windowElement.style.position = 'absolute';
    windowElement.style.backgroundColor = WebXColorGenerator.indexedColour(object.id);
    windowElement.style.pointerEvents = 'none';

    this.updateGeometry(windowElement, object);

    this._desktop.appendChild(windowElement);

    this._windowElements.set(object.id, windowElement);
  }

  private removeWindowElement(windowId: number, windowElement: HTMLElement) {
    this._desktop.removeChild(windowElement);
    this._windowElements.delete(windowId);
  }

  private updateGeometry(element: HTMLElement, object: Object3D) {
    const x = object.position.x - 0.5 * object.scale.x;
    const y = object.position.y - 0.5 * object.scale.y;
    element.style.top = `${y}px`;
    element.style.left = `${x}px`;
    element.style.width = `${object.scale.x}px`;
    element.style.height = `${object.scale.y}px`;
    element.style.zIndex = `${object.position.z}`;
  }

  private createElementNS(name: string): HTMLElement {
    return document.createElementNS('http://www.w3.org/1999/xhtml', name);
  }
}
