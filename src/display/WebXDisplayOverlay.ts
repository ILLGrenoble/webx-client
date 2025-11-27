import {WebXCursor} from "./WebXCursor";

/**
 * WebXDisplayOverlay
 *
 * Manages an absolute-positioned overlay element that hosts the WebX cursor canvas.
 * The overlay is initially hidden and can be toggled via the `visible` setter.
 */
export class WebXDisplayOverlay {

  /**
   * The underlying overlay DOM element.
   */
  private readonly _overlayElement: HTMLElement;

  /**
   * Accessor for the overlay DOM element.
   *
   * @returns The root overlay HTMLElement used to host overlay content.
   */
  get overlayElement(): HTMLElement {
    return this._overlayElement;
  }

  /**
   * Show or hide the overlay.
   *
   * @param visible - `true` to show the overlay, `false` to hide it.
   */
  set visible(visible: boolean) {
    this._overlayElement.style.visibility = visible ? 'visible' : 'hidden';
  }

  /**
   * Create a new WebXDisplayOverlay.
   *
   * @param _cursor - The WebXCursor instance whose canvas will be appended to the overlay.
   */
  constructor(private _cursor: WebXCursor) {
    this._overlayElement = this._createDisplayOverlayElement();
    this._overlayElement.appendChild(this._cursor.canvas);
  }

  /**
   * Update per-frame overlay logic.
   *
   * Call this from the application's render loop if the overlay needs per-frame updates
   * (positioning, visibility logic, etc.). Currently a no-op.
   */
  public update(): void {
  }

  /**
   * Create and configure the overlay HTMLElement.
   *
   * The element is positioned absolutely to cover its container, uses a high z-index,
   * and starts hidden with overflow clipped.
   *
   * @returns A configured `div` element to use as the display overlay.
   */
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
