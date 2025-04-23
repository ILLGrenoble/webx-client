import { WebXMessage } from './WebXMessage';
import { WebXMessageType } from './WebXMessageType';

/**
 * Represents a message indicating a connection to the WebX Engine.
 *
 * This message is sent when a connection is established.
 */
export class WebXConnectionMessage extends WebXMessage {

  /**
   * Constructs a new WebXConnectionMessage.
   */
  constructor() {
    super(WebXMessageType.CONNECTION);
  }
}
