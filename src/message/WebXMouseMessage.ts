import { WebXMessage } from './WebXMessage';
import { WebXMessageType } from './WebXMessageType';

export class WebXMouseMessage extends WebXMessage {
  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  get cursorId(): number {
    return this._cursorId;
  }

  constructor(private _x: number, private _y: number, private _cursorId: number, commandId: number) {
    super(WebXMessageType.MOUSE, commandId);
  }
}
