import { WebXMessage } from './WebXMessage';
import { WebXMessageType } from './WebXMessageType';

export class WebXScreenMessage extends WebXMessage {
  public get screenSize(): { width: number; height: number } {
    return this._screenSize;
  }

  constructor(private _screenSize: { width: number; height: number }, commandId: number) {
    super(WebXMessageType.SCREEN, commandId);
  }
}
