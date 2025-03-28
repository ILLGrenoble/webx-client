import { WebXTunnel } from '../tunnel';
import {WebXCursorImageMessage, WebXImageMessage} from '../message';
import {WebXCursorImageInstruction, WebXImageInstruction} from '../instruction';
import { Texture } from 'three';

export interface WebXCursorData {
  xHot: number;
  yHot: number;
  cursorId: number;
  texture: Texture;
}

export class WebXCursorFactory {
  private _cursorMap: Map<number, WebXCursorData> = new Map();

  constructor(private _tunnel: WebXTunnel) {}

  public async getCursor(cursorId?: number): Promise<{x?: number; y?: number; cursor: WebXCursorData}> {
    const cursorData = this._cursorMap.get(cursorId);
    if (cursorData != null) {
      return { cursor: cursorData };

    } else {
      const response = await this._tunnel.sendRequest(new WebXCursorImageInstruction(cursorId)) as WebXCursorImageMessage;

      const newCursorData = {
        xHot: response.xHot,
        yHot: response.yHot,
        cursorId: response.cursorId,
        texture: response.texture
      }

      this._cursorMap.set(response.cursorId, newCursorData);

      return {
        x: response.x,
        y: response.y,
        cursor: newCursorData
      };
    }
  }
}
