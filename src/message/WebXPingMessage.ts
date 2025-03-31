import { WebXMessage } from './WebXMessage';
import { WebXMessageType } from './WebXMessageType';

/**
 * Represents a ping message for connection health checks.
 * 
 * This message is sent by the WebX Engine to ensure the connection is active. The client responds with 
 * an WebXPongInstruction.
 */
export class WebXPingMessage extends WebXMessage {
  /**
   * Constructs a new WebXPingMessage.
   */
  constructor() {
    super(WebXMessageType.PING);
  }
}
