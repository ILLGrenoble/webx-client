import {WebXCursor} from "./WebXCursor";

export class WebXDisplayOverlay {

  private readonly _overlayElement: HTMLElement;

  get overlayElement(): HTMLElement {
    return this._overlayElement;
  }

  set visible(visible: boolean) {
    this._overlayElement.style.visibility = visible ? 'visible' : 'hidden';
  }

  constructor(private _cursor: WebXCursor) {
    this._overlayElement = this._createDisplayOverlayElement();
    this._overlayElement.appendChild(this._cursor.canvas);
  }

  public update(): void {
  }

  private _createDisplayOverlayElement(): HTMLElement {
    const element = document.createElement('div');
    element.id = 'webx-overlay';
    element.style.position = 'absolute';
    element.style.width = '100%';
    element.style.height = '100%';
    element.style.zIndex = '999';
    element.style.visibility = 'hidden';
    element.style.overflow = 'clip';

    return element;
  }

}
