import { WebXMessage } from './WebXMessage';
import { WebXMessageType } from './WebXMessageType';

export class WebXQualityMessage extends WebXMessage {

  get index(): number {
    return this._index;
  }

  get imageFPS(): number {
    return this._imageFPS;
  }

  get rgbQuality(): number {
    return this._rgbQuality;
  }

  get alphaQuality(): number {
    return this._alphaQuality;
  }

  get maxMbps(): number {
    return this._maxMbps;
  }

  constructor(private _index: number, private _imageFPS: number, private _rgbQuality: number, private _alphaQuality: number, private _maxMbps: number) {
    super(WebXMessageType.QUALITY);
  }
}
