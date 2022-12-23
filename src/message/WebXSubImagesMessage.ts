import { WebXMessage } from './WebXMessage';
import { WebXMessageType } from './WebXMessageType';
import { WebXSubImage } from '../display';

export class WebXSubImagesMessage extends WebXMessage {
  public get windowId(): number {
    return this._windowId;
  }

  public get subImages(): WebXSubImage[] {
    return this._subImages;
  }

  get size(): number {
    return this._size;
  }

  constructor(private _windowId: number, private _subImages: WebXSubImage[], commandId: number, private _size: number) {
    super(WebXMessageType.SUBIMAGES, commandId);
  }
}
