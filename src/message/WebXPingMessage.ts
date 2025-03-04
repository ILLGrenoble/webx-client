import { WebXMessage } from './WebXMessage';
import { WebXMessageType } from './WebXMessageType';

export class WebXPingMessage extends WebXMessage {
  constructor() {
    super(WebXMessageType.PING);
  }
}
