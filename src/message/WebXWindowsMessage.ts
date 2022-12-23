import { WebXMessage } from './WebXMessage';
import { WebXWindowProperties } from '../display';
import { WebXMessageType } from './WebXMessageType';

export class WebXWindowsMessage extends WebXMessage {
  public get windows(): Array<WebXWindowProperties> {
    return this._windows;
  }

  constructor(private _windows: Array<WebXWindowProperties>, commandId: number) {
    super(WebXMessageType.WINDOWS, commandId);
  }
}
