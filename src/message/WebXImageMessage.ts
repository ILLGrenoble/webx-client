import { WebXMessage } from './WebXMessage';
import { WebXMessageType } from './WebXMessageType';
import { Texture } from 'three';

export class WebXImageMessage extends WebXMessage {
  public get windowId(): number {
    return this._windowId;
  }

  public get depth(): number {
    return this._depth;
  }

  public get colorMap(): Texture {
    return this._colorMap;
  }

  public get alphaMap(): Texture {
    return this._alphaMap;
  }

  public get size(): number {
    return this._size;
  }

  constructor(private _windowId: number, private _depth: number, private _colorMap: Texture, private _alphaMap: Texture, commandId: number, private _size: number) {
    super(WebXMessageType.IMAGE, commandId);
  }
}
