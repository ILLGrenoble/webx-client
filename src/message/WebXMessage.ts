import { WebXMessageType } from './WebXMessageType';

export class WebXMessage {
  public get type(): WebXMessageType {
    return this._messageType;
  }

  public get commandId(): number {
    return this._commandId;
  }

  constructor(private _messageType: WebXMessageType, private _commandId: number = 0) {}
}
