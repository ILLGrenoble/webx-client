import { WebXKeyEvent } from './WebXKeyEvent';
import { WebXKeyboard } from '../WebXKeyboard';

export class WebXKeydownEvent extends WebXKeyEvent {

  private readonly _keyupReliable: boolean;
  private _keyCode: number;
  private _keyIdentifier: string;
  private _key: string;
  private _location: number;

  public get keyCode(): number {
    return this._keyCode;
  }

  public set keyCode(keyCode: number) {
    this._keyCode = keyCode;
  }

  public get keyIdentifier(): string {
    return this._keyIdentifier;
  }

  public set keyIdentifier(keyIdentifier: string) {
    this._keyIdentifier = keyIdentifier;
  }

  public get key(): string {
    return this._key;
  }

  public set key(key: string) {
    this._key = key;
  }

  public get location(): number {
    return this._location;
  }

  public set location(location: number) {
    this._location = location;
  }

  public get keyupReliable(): boolean {
    return this._keyupReliable;
  }

  /**
   * Information related to the pressing of a key, which need not be a key
   * associated with a printable character. The presence or absence of any
   * information within this object is browser-dependent.
   *
   * @constructor
   * @augments WebXKeyEvent
   * @param {number} keyCode The JavaScript key code of the key pressed.
   * @param {string} keyIdentifier The legacy DOM3 "keyIdentifier" of the key
   *                               pressed, as defined at:
   *                               http://www.w3.org/TR/2009/WD-DOM-Level-3-Events-20090908/#events-Events-KeyboardEvent
   * @param {string} key The standard name of the key pressed, as defined at:
   *                     http://www.w3.org/TR/DOM-Level-3-Events/#events-KeyboardEvent
   * @param {number} location The location on the keyboard corresponding to
   *                          the key pressed, as defined at:
   *                          http://www.w3.org/TR/DOM-Level-3-Events/#events-KeyboardEvent
   */
  constructor(keyCode: number, keyIdentifier: string, key: string, location: number) {
    super();
    this._keyCode = keyCode;
    this._keyIdentifier = keyIdentifier;
    this._key = key;
    this._location = location;
    this._keyupReliable = !WebXKeyboard.quirks.keyupUnreliable;
    this._keysym = this.keysymFromKeyIdentifier(key, location) || this.keysymFromKeycode(keyCode, location);

    if (this._keysym && !this.isPrintable()) {
      this._reliable = true;
    }

    if (!this._keysym && this.keyIdentifierSane(keyCode, keyIdentifier)) {
      this._keysym = this.keysymFromKeyIdentifier(keyIdentifier, location, WebXKeyboard.modifiers.shift);
    }

    // If a key is pressed while meta is held down, the keyup will
    // never be sent in Chrome (bug #108404)
    if (WebXKeyboard.modifiers.meta && this._keysym !== 0xFFE7 && this._keysym !== 0xFFE8) {
      this._keyupReliable = false;
    } else if (this.keysym === 0xFFE5 && WebXKeyboard.quirks.capsLockKeyupUnreliable) {
      this._keyupReliable = false;
    }

    // Determine whether default action for Ctrl+combinations must be prevented
    const preventAlt = !WebXKeyboard.modifiers.ctrl && !WebXKeyboard.quirks.altIsTypableOnly;

    // Determine whether default action for Ctrl+combinations must be prevented
    const preventCtrl = !WebXKeyboard.modifiers.alt;

    // We must rely on the (potentially buggy) keyIdentifier if preventing
    // the default action is important
    if ((preventCtrl && WebXKeyboard.modifiers.ctrl)
      || (preventAlt && WebXKeyboard.modifiers.alt)
      || WebXKeyboard.modifiers.meta
      || WebXKeyboard.modifiers.hyper) {
      this.reliable = true;
    }

  }
}
