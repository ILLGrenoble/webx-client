const Guacamole = require('./GuacamoleKeyboard');

/**
 * Represents the keyboard input device in the WebX client.
 *
 * This class handles keyboard events, such as key presses and releases,
 * and provides methods to interact with the keyboard state.
 */
export class WebXKeyboard {

  private _keyboard: Guacamole.Keyboard;

  public set onKeyDown(onKeyDown: (key: any) => void) {
    this._keyboard.onkeydown = onKeyDown;
  }

  public set onKeyUp(onKeyUp: (key: any) => void) {
    this._keyboard.onkeyup = onKeyUp;
  }

  /**
   * Constructs a new WebXKeyboard instance.
   * This creates a Guacamole.Keyboard instance and attaches event listeners.
   *
   * @param element The HTML element to attach the keyboard events to.
   */
  constructor(element: HTMLElement | Document) {
    this._keyboard = new Guacamole.Keyboard(element);
  }

  /**
   * Disposes of the keyboard instance and removes event listeners.
   */
  public dispose(): void {
    this._keyboard.onkeydown = null;
    this._keyboard.onkeyup = null;
    this._keyboard.dispose();
  }

  /**
   * Resets the keyboard state.
   * This clears any pressed keys and resets the keyboard to its initial state.
   */
  public reset(): void {
    this._keyboard.reset();
  }

}
