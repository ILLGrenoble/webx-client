import { WebXMessage } from './WebXMessage';
import { WebXMessageType } from './WebXMessageType';

/**
 * Represents a no-operation message: has no effect.
 */
export class WebXNopMessage extends WebXMessage {

  /**
   * Constructs a new WebXNopMessage.
   */
  constructor() {
    super(WebXMessageType.NOP);
  }
}
