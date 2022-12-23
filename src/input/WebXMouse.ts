import { WebXMouseState } from './mouse';

export class WebXMouse {
  /**
   * The current mouse state. The properties of this state are updated when
   * mouse events fire. This state object is also passed in as a parameter to
   * the handler of any mouse events.
   */
  private _currentState: WebXMouseState;

  private _contextMenuHandler = this._handleContextMenu.bind(this);
  private _mouseMoveHandler = this._handleMouseMove.bind(this);
  private _mouseDownHandler = this._handleMouseDown.bind(this);
  private _mouseUpHandler = this._handleMouseUp.bind(this);
  private _mouseOutHandler = this._handleMouseOut.bind(this);
  private _mouseWheelHandler = this._handleMouseWheel.bind(this);

  /**
   * Provides cross-browser mouse events for a given element
   * @param _element The element to use to provide mouse events
   */
  constructor(private _element: HTMLElement) {
    this._bindListeners();
    this._createDefaultState();
  }

  dispose(): void {
    this._unbindListeners();
  }

  /**
   * Cancel an event
   * @param event the event to cancel
   */
  private _cancelEvent(event: Event): void {
    event.stopPropagation();
    if (event.preventDefault) {
      event.preventDefault();
    }
    event.returnValue = false;
  }

  /**
   * Bind the mouse listeners to the given element
   */
  private _bindListeners(): void {
    const element = this._element;
    element.addEventListener('contextmenu', this._contextMenuHandler, false);
    element.addEventListener('mousemove', this._mouseMoveHandler);
    element.addEventListener('mousedown', this._mouseDownHandler);
    element.addEventListener('mouseup', this._mouseUpHandler);
    element.addEventListener('mouseout', this._mouseOutHandler);
    ['DOMMouseScroll', 'mousewheel', 'wheel'].forEach(listener => {
      element.addEventListener(listener, this._mouseWheelHandler, { passive: false });
    });
    this.reset = this.reset.bind(this);
  }

  private _unbindListeners(): void {
    const element = this._element;
    element.removeEventListener('contextmenu', this._contextMenuHandler, false);
    element.removeEventListener('mousemove', this._mouseMoveHandler);
    element.removeEventListener('mousedown', this._mouseDownHandler);
    element.removeEventListener('mouseup', this._mouseUpHandler);
    element.removeEventListener('mouseout', this._mouseOutHandler);
    ['DOMMouseScroll', 'mousewheel', 'wheel'].forEach(listener => {
      element.removeEventListener(listener, this._mouseWheelHandler);
    });
    this.reset = this.reset.bind(this);
  }

  private _createDefaultState(): void {
    this._currentState = new WebXMouseState({
      x: 0,
      y: 0,
      left: false,
      middle: false,
      right: false,
      up: false,
      down: false
    });
  }

  /**
   * Process mouse up event
   * @param event the mouse event
   */
  private _handleMouseUp(event: MouseEvent): void {
    const currentState = this._currentState;
    switch (event.button) {
      case 0:
        currentState.left = false;
        break;
      case 1:
        currentState.middle = false;
        break;
      case 2:
        currentState.right = false;
        break;
    }
    this.onMouseUp(currentState);
  }

  /**
   * Process mouse down event
   * @param event the mouse event
   */
  private _handleMouseDown(event: MouseEvent): void {
    this._cancelEvent(event);
    const currentState = this._currentState;
    switch (event.button) {
      case 0:
        currentState.left = true;
        break;
      case 1:
        currentState.middle = true;
        break;
      case 2:
        currentState.right = true;
        break;
    }
    this.onMouseDown(currentState);
  }

  /**
   * Process mouse wheel event
   * @param event the mouse event
   */
  private _handleMouseWheel(event: WheelEvent): void {
    const currentState = this._currentState;
    if (event.deltaY < 0) {
      currentState.up = true;
      this.onMouseDown(currentState);

      currentState.up = false;
      this.onMouseUp(currentState);
    }

    if (event.deltaY > 0) {
      currentState.down = true;
      this.onMouseDown(currentState);

      currentState.down = false;
      this.onMouseUp(currentState);
    }
    this._cancelEvent(event);
  }

  /**
   * Process mouse out event
   * @param event the mouse event
   */
  private _handleMouseOut(): void {
    // reset all buttons
    const currentState = this._currentState;
    currentState.releaseButtons();
    this.onMouseUp(currentState);
    this.onMouseOut(currentState);
  }

  /**
   * Process the mouse move event
   * @param event the mouse event
   */
  private _handleMouseMove(event: MouseEvent): void {
    this._cancelEvent(event);
    const currentState = this._currentState;
    // get the container wrapping the display canvas element
    const bounds = this._element.firstElementChild.getBoundingClientRect();
    currentState.x = event.clientX - bounds.left;
    currentState.y = event.clientY - bounds.top;
    this.onMouseMove(currentState);
  }

  /**
   * Resets the mouse state
   */
  public reset(): void {
    this._createDefaultState();
  }
  /**
   * Process the context menu event
   * Block context menu so right-click gets sent properly
   * @param event the mouse event
   */
  private _handleContextMenu(event: MouseEvent): void {
    this._cancelEvent(event);
  }


  /**
   * Fired whenever the user moves the mouse
   * @param mouseState the current mouse state
   */
  // eslint-disable-next-line
  onMouseMove(mouseState: WebXMouseState): void { }

  /**
   * Fired whenever a mouse button is effectively pressed. This can happen
   * as part of a "click" gesture initiated by the user by tapping one
   * or more fingers over the touchpad element, as part of a "scroll"
   * gesture initiated by dragging two fingers up or down, etc.
   *
   * @param mouseState the current mouse state
   */
  // eslint-disable-next-line
  onMouseDown(mouseState: WebXMouseState): void { }

  /**
   * Fired whenever a mouse button is effectively released. This can happen
   * as part of a "click" gesture initiated by the user by tapping one
   * or more fingers over the touchpad element, as part of a "scroll"
   * gesture initiated by dragging two fingers up or down, etc.
   * @param mouseState the current mouse state
   */
  // eslint-disable-next-line
  onMouseUp(mouseState: WebXMouseState): void { }

  /**
   * Fired whenever the mouse leaves the boundaries of the element associated
   * with this mouse
   *
   * @param mouseState the current mouse state
   */
  // eslint-disable-next-line
  onMouseOut(mouseState: WebXMouseState): void { }

}
