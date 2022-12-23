import { WebXMessage } from './WebXMessage';
import { WebXMessageType } from './WebXMessageType';

export class WebXPollMessage extends WebXMessage {
  constructor() {
    super(WebXMessageType.POLL);
  }
}
