import { WebXMessage } from './WebXMessage';
import { WebXMessageType } from './WebXMessageType';

/**
 * Represents a message containing clipboard content.
 *
 * This message is received from the WebX Engine and contains the clipboard content in the X11 server.
 */
export class WebXClipboardMessage extends WebXMessage {

  /**
   * The content of the clipboard.
   * @private
   */
  public readonly clipboardContent: string;

  /**
   * Constructs a new WebXClipboardMessage.
   *
   * @param clipboardContent The content of the clipboard.
   */
  constructor(clipboardContent: string) {
    super(WebXMessageType.CLIPBOARD);
    this.clipboardContent = clipboardContent;
  }
}
