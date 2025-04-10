export class WebXMouseState {
  /**
   * The current X position of the mouse pointer
   */
  private _x: number;

  /**
   * The current Y position of the mouse poinrter
   */
  private _y: number;

  /**
   * Whether the left mouse button is currently pressed.
   */
  private _left: boolean;

  /**
   * Whether the middle mouse button is currently pressed.
   */
  private _middle: boolean;

  /**
   * Whether the right mouse button is currently pressed.
   */
  private _right: boolean;

  /**
   * Whether the up mouse button is currently pressed. This is the fourth
   * mouse button, associated with upward scrolling of the mouse scroll
   * wheel.
   */
  private _up: boolean;

  /**
   * Whether the down mouse button is currently pressed. This is the fifth
   * mouse button, associated with downward scrolling of the mouse scroll
   * wheel.
   */
  private _down: boolean;

  /**
   * Whether the shift button is currently pressed.
   */
  private _shift: boolean;

  /**
   * Whether the ctrl button is currently pressed.
   */
  private _ctrl: boolean;

  /**
   * Whether the alt button is currently pressed.
   */
  private _alt: boolean;

  /**
   * Gets the current X position of the mouse pointer.
   *
   * @returns The X-coordinate as a number.
   */
  public get x(): number {
    return this._x;
  }

  /**
   * Sets the current X position of the mouse pointer.
   *
   * @param value The new X-coordinate as a number.
   */
  public set x(value: number) {
    this._x = value;
  }

  /**
   * Gets the current Y position of the mouse pointer.
   *
   * @returns The Y-coordinate as a number.
   */
  public get y(): number {
    return this._y;
  }

  /**
   * Sets the current Y position of the mouse pointer.
   *
   * @param value The new Y-coordinate as a number.
   */
  public set y(value: number) {
    this._y = value;
  }

  /**
   * Gets whether the left mouse button is currently pressed.
   *
   * @returns True if the left button is pressed, false otherwise.
   */
  public get left(): boolean {
    return this._left;
  }

  /**
   * Sets whether the left mouse button is currently pressed.
   *
   * @param value True to indicate the left button is pressed, false otherwise.
   */
  public set left(value: boolean) {
    this._left = value;
  }

  /**
   * Gets whether the middle mouse button is currently pressed.
   *
   * @returns True if the middle button is pressed, false otherwise.
   */
  public get middle(): boolean {
    return this._middle;
  }

  /**
   * Sets whether the middle mouse button is currently pressed.
   *
   * @param value True to indicate the middle button is pressed, false otherwise.
   */
  public set middle(value: boolean) {
    this._middle = value;
  }

  /**
   * Gets whether the right mouse button is currently pressed.
   *
   * @returns True if the right button is pressed, false otherwise.
   */
  public get right(): boolean {
    return this._right;
  }

  /**
   * Sets whether the right mouse button is currently pressed.
   *
   * @param value True to indicate the right button is pressed, false otherwise.
   */
  public set right(value: boolean) {
    this._right = value;
  }

  /**
   * Gets whether the up mouse button (scroll up) is currently pressed.
   *
   * @returns True if the up button is pressed, false otherwise.
   */
  public get up(): boolean {
    return this._up;
  }

  /**
   * Sets whether the up mouse button (scroll up) is currently pressed.
   *
   * @param value True to indicate the up button is pressed, false otherwise.
   */
  public set up(value: boolean) {
    this._up = value;
  }

  /**
   * Gets whether the down mouse button (scroll down) is currently pressed.
   *
   * @returns True if the down button is pressed, false otherwise.
   */
  public get down(): boolean {
    return this._down;
  }

  /**
   * Sets whether the down mouse button (scroll down) is currently pressed.
   *
   * @param value True to indicate the down button is pressed, false otherwise.
   */
  public set down(value: boolean) {
    this._down = value;
  }

  /**
   * Gets whether the shift key is currently pressed.
   *
   * @returns True if the shift key is pressed, false otherwise.
   */
  public get shift(): boolean {
    return this._shift;
  }

  /**
   * Sets whether the shift key is currently pressed.
   *
   * @param value True to indicate the shift key is pressed, false otherwise.
   */
  public set shift(value: boolean) {
    this._shift = value;
  }

  /**
   * Gets whether the ctrl key is currently pressed.
   *
   * @returns True if the ctrl key is pressed, false otherwise.
   */
  public get ctrl(): boolean {
    return this._ctrl;
  }

  /**
   * Sets whether the ctrl key is currently pressed.
   *
   * @param value True to indicate the ctrl key is pressed, false otherwise.
   */
  public set ctrl(value: boolean) {
    this._ctrl = value;
  }

  /**
   * Gets whether the alt key is currently pressed.
   *
   * @returns True if the alt key is pressed, false otherwise.
   */
  public get alt(): boolean {
    return this._alt;
  }

  /**
   * Sets whether the alt key is currently pressed.
   *
   * @param value True to indicate the alt key is pressed, false otherwise.
   */
  public set alt(value: boolean) {
    this._alt = value;
  }

  /**
   * Create a new mouse state instance
   * @param state the mouse state
   */
  constructor(state: { x: number; y: number; left: boolean; middle: boolean; right: boolean; up: boolean; down: boolean }) {
    const { x, y, left, middle, right, up, down } = state;
    this._x = x;
    this._y = y;
    this._left = left;
    this._middle = middle;
    this._right = right;
    this._up = up;
    this._down = down;
  }

  /**
   * Releases all mouse buttons by setting their states to false.
   */
  public releaseButtons(): void {
    this._left = false;
    this._middle = false;
    this._right = false;
  }

  /**
   * Generates a bitmask representing the current state of mouse buttons and modifiers.
   *
   * @returns A number representing the button mask.
   */
  public getButtonMask(): number {
    let mask = 0;
    mask |= this._left ? 1 << 8 : 0;
    mask |= this._middle ? 1 << 9 : 0;
    mask |= this._right ? 1 << 10 : 0;
    mask |= this._up ? 1 << 11 : 0;
    mask |= this._down ? 1 << 12 : 0;
    mask |= this._shift ? 1 << 0 : 0;
    mask |= this._ctrl ? 1 << 2 : 0;
    mask |= this._alt ? 1 << 3 : 0;
    return mask;
  }

  public clone(): WebXMouseState {
    return new WebXMouseState({
      x: this._x,
      y: this._y,
      left: this._left,
      middle: this._middle,
      right: this._right,
      up: this._up,
      down: this._down
    });
  }

}
