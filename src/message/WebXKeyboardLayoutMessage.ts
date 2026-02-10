import { WebXMessage } from './WebXMessage';
import { WebXMessageType } from './WebXMessageType';

/**
 * Represents a message containing the keyboard layout name.
 *
 * This message is received from the WebX Engine when a client changes the keyboard layout
 */
export class WebXKeyboardLayoutMessage extends WebXMessage {

  /**
   * The keyboard layout name.
   * @private
   */
  public readonly keyboardLayoutName: string;

  /**
   * Constructs a new WebXKeyboardLayoutMessage.
   *
   * @param keyboardLayoutName The content of the clipboard.
   */
  constructor(keyboardLayoutName: string) {
    super(WebXMessageType.KEYBOARD_LAYOUT);
    this.keyboardLayoutName = keyboardLayoutName;
  }
}
