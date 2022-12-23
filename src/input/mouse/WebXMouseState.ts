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

  private _shift: boolean;

  private _ctrl: boolean;

  private _alt: boolean;

  public get x(): number {
    return this._x;
  }

  public set x(value: number) {
    this._x = value;
  }

  public get y(): number {
    return this._y;
  }

  public set y(value: number) {
    this._y = value;
  }

  public get left(): boolean {
    return this._left;
  }

  public set left(value: boolean) {
    this._left = value;
  }

  public get middle(): boolean {
    return this._middle;
  }

  public set middle(value: boolean) {
    this._middle = value;
  }

  public get right(): boolean {
    return this._right;
  }

  public set right(value: boolean) {
    this._right = value;
  }

  public get up(): boolean {
    return this._up;
  }

  public set up(value: boolean) {
    this._up = value;
  }

  public get down(): boolean {
    return this._down;
  }

  public set down(value: boolean) {
    this._down = value;
  }

  public get shift(): boolean {
    return this._shift;
  }

  public set shift(value: boolean) {
    this._shift = value;
  }

  public get ctrl(): boolean {
    return this._ctrl;
  }

  public set ctrl(value: boolean) {
    this._ctrl = value;
  }

  public get alt(): boolean {
    return this._alt;
  }

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
   * Release all buttons
   */
  public releaseButtons(): void {
    this._left = false;
    this._middle = false;
    this._right = false;
  }

  /**
   * Get a button mask for this mouse state
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

}
