/**
 * Represents the state of keyboard modifiers (e.g., Shift, Ctrl, Alt).
 * 
 * This class tracks the state of each modifier key and provides methods
 * to update and retrieve the state.
 */
export class WebXKeyboardModifierState {
  /**
   * Whether the Shift key is pressed.
   */
  private _shift: boolean = false;

  /**
   * Whether the Ctrl key is pressed.
   */
  private _ctrl: boolean = false;

  /**
   * Whether the Alt key is pressed.
   */
  private _alt: boolean = false;

  /**
   * Whether the Meta key (e.g., Command on macOS) is pressed.
   */
  private _meta: boolean = false;

  /**
   * Whether the Hyper key is pressed.
   */
  private _hyper: boolean = false;

  /**
   * Gets whether the Shift key is pressed.
   * 
   * @returns True if the Shift key is pressed, false otherwise.
   */
  public get shift(): boolean {
    return this._shift;
  }

  /**
   * Sets whether the Shift key is pressed.
   * 
   * @param value True to indicate the Shift key is pressed, false otherwise.
   */
  public set shift(value: boolean) {
    this._shift = value;
  }

  /**
   * Gets whether the Ctrl key is pressed.
   * 
   * @returns True if the Ctrl key is pressed, false otherwise.
   */
  public get ctrl(): boolean {
    return this._ctrl;
  }

  /**
   * Sets whether the Ctrl key is pressed.
   * 
   * @param value True to indicate the Ctrl key is pressed, false otherwise.
   */
  public set ctrl(value: boolean) {
    this._ctrl = value;
  }

  /**
   * Gets whether the Alt key is pressed.
   * 
   * @returns True if the Alt key is pressed, false otherwise.
   */
  public get alt(): boolean {
    return this._alt;
  }

  /**
   * Sets whether the Alt key is pressed.
   * 
   * @param value True to indicate the Alt key is pressed, false otherwise.
   */
  public set alt(value: boolean) {
    this._alt = value;
  }

  /**
   * Gets whether the Meta key (e.g., Command on macOS) is pressed.
   * 
   * @returns True if the Meta key is pressed, false otherwise.
   */
  public get meta(): boolean {
    return this._meta;
  }

  /**
   * Sets whether the Meta key (e.g., Command on macOS) is pressed.
   * 
   * @param value True to indicate the Meta key is pressed, false otherwise.
   */
  public set meta(value: boolean) {
    this._meta = value;
  }

  /**
   * Gets whether the Hyper key is pressed.
   * 
   * @returns True if the Hyper key is pressed, false otherwise.
   */
  public get hyper(): boolean {
    return this._hyper;
  }

  /**
   * Sets whether the Hyper key is pressed.
   * 
   * @param value True to indicate the Hyper key is pressed, false otherwise.
   */
  public set hyper(value: boolean) {
    this._hyper = value;
  }

  /**
   * Creates a new instance of WebXKeyboardModifierState.
   * 
   * @param state Optional initial state of the keyboard modifiers.
   *              Contains the state of Shift, Ctrl, Alt, Meta, and Hyper keys.
   */
  constructor(state?: { shift: boolean; ctrl: boolean; alt: boolean; meta: boolean; hyper: boolean }) {
    if (state) {
      const { shift, ctrl, alt, meta, hyper } = state;
      this._shift = shift;
      this._ctrl = ctrl;
      this._alt = alt;
      this._meta = meta;
      this._hyper = hyper;
    }
  }

  /**
   * Updates the modifier state based on a keyboard event.
   * 
   * @param event The keyboard event to process.
   * @returns The updated modifier state.
   */
  public fromKeyboardEvent(event: KeyboardEvent): this {
    this._shift = event.shiftKey;
    this._ctrl = event.ctrlKey;
    this._alt = event.altKey;
    this._meta = event.metaKey;

    if (event.getModifierState) {
      this.hyper = event.getModifierState('OS')
        || event.getModifierState('Super')
        || event.getModifierState('Hyper')
        || event.getModifierState('Win');
    }

    return this;
  }
}
