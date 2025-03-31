import { WebXKeyEvent } from './WebXKeyEvent';
import { WebXKeyboardUtils } from './WebXKeyboardUtils';

/**
 * Represents a key press event in the WebX client.
 * 
 * This event is associated with a printable character and contains information
 * about the character code and its corresponding keysym.
 */
export class WebXKeyPressEvent extends WebXKeyEvent {
  private _charCode: number;

  /**
   * Gets the character code associated with this key press event.
   * 
   * The character code represents the Unicode value of the pressed key.
   * 
   * @returns The character code.
   */
  public get charCode(): number {
    return this._charCode;
  }

  /**
   * Sets the character code for this key press event.
   * 
   * @param charCode The character code to set.
   */
  public set charCode(charCode: number) {
    this._charCode = charCode;
  }

  /**
   * Constructs a new WebXKeyPressEvent.
   * 
   * @param charCode The character code of the pressed key.
   */
  constructor(charCode: number) {
    super();
    this.charCode = charCode;
    this.keysym = WebXKeyboardUtils.keysymFromCharCode(charCode);
    this.reliable = true;
  }
}
