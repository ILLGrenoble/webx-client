const Guacamole = require('./GuacamoleKeyboard');

/**
 * Represents the keyboard input device in the WebX client.
 *
 * This class handles keyboard events, such as key presses and releases,
 * and provides methods to interact with the keyboard state.
 */
export class WebXKeyboard {

  private _keyboard: Guacamole.Keyboard;
  private _onKeyDown: (key: any) => void = () => {};
  private _onKeyUp: (key: any) => void = () => {};

  public set onKeyDown(onKeyDown: (key: any) => void) {
    this._onKeyDown = onKeyDown;
  }

  public set onKeyUp(onKeyUp: (key: any) => void) {
    this._onKeyUp = onKeyUp;
  }

  /**
   * Constructs a new WebXKeyboard instance.
   * This creates a Guacamole.Keyboard instance and attaches event listeners.
   *
   * @param element The HTML element to attach the keyboard events to.
   */
  constructor(element: HTMLElement | Document) {
    this._keyboard = new Guacamole.Keyboard(element);
    this._keyboard.onkeydown = (key) => this.onKeyDownHandler(key);
    this._keyboard.onkeyup = (key) => this.onKeyUpHandler(key);
  }

  /**
   * Disposes of the keyboard instance and removes event listeners.
   */
  public dispose(): void {
    this._keyboard.onkeydown = null;
    this._keyboard.onkeyup = null;
    this.onKeyDown = () => {};
    this.onKeyUp = () => {};
  }

  /**
   * Resets the keyboard state.
   * This clears any pressed keys and resets the keyboard to its initial state.
   */
  public reset(): void {
    this._keyboard.reset();
  }

  /**
   * Fired whenever the user presses a key with the element associated
   * with this keyboard in focus.
   *
   * @param key The key being pressed
   */
  private onKeyDownHandler(key: any): void {
    console.log(key);
    this._onKeyDown(key);
  }

  /**
   * Fired whenever the user releases a key with the element associated
   * with this keyboard in focus.
   *
   * @param key The key being released
   */
  private onKeyUpHandler(key: any): void {
    this._onKeyUp(key);
  }

}
