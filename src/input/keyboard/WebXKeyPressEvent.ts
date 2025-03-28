import { WebXKeyEvent } from './WebXKeyEvent';
import { WebXKeyboardUtils } from './WebXKeyboardUtils';

/**
 * Information related to the pressing of a key, which MUST be
 * associated with a printable character. The presence or absence of any
 * information within this object is browser-dependent.
 */
export class WebXKeyPressEvent extends WebXKeyEvent {
  private _charCode: number;

  public get charCode(): number {
    return this._charCode;
  }

  public set charCode(charCode: number) {
    this._charCode = charCode;
  }

  constructor(charCode: number) {
    super();
    this.charCode = charCode;
    this.keysym = WebXKeyboardUtils.keysymFromCharCode(charCode);
    this.reliable = true;
  }
}
