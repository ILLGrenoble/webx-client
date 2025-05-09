import { WebXKeyEvent } from './WebXKeyEvent';
import { WebXKeyboard } from '../WebXKeyboard';

/**
 * Represents a keydown event in the WebX client.
 *
 * This event is triggered when a key is pressed down.
 */
export class WebXKeydownEvent extends WebXKeyEvent {

  /**
   * Indicates whether the keyup event is reliable for this key.
   */
  public readonly keyupReliable: boolean;

  /**
   * The JavaScript key code of the key pressed.
   */
  public readonly keyCode: number;

  /**
   * The legacy DOM3 "keyIdentifier" of the key pressed.
   */
  public readonly keyIdentifier: string;

  /**
   * The standard name of the key pressed.
   */
  public readonly key: string;

  /**
   * The location on the keyboard corresponding to the key pressed.
   */
  public readonly location: number;

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
    this.keyCode = keyCode;
    this.keyIdentifier = keyIdentifier;
    this.key = key;
    this.location = location;
    this.keyupReliable = !WebXKeyboard.quirks.keyupUnreliable;
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
      this.keyupReliable = false;
    } else if (this.keysym === 0xFFE5 && WebXKeyboard.quirks.capsLockKeyupUnreliable) {
      this.keyupReliable = false;
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
