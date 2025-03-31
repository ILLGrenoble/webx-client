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

  public get meta(): boolean {
    return this._meta;
  }

  public set meta(value: boolean) {
    this._meta = value;
  }

  public get hyper(): boolean {
    return this._hyper;
  }

  public set hyper(value: boolean) {
    this._hyper = value;
  }

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
