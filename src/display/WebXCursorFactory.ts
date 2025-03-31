import { WebXTunnel } from '../tunnel';
import {WebXCursorImageMessage, WebXImageMessage} from '../message';
import {WebXCursorImageInstruction, WebXImageInstruction} from '../instruction';
import { Texture } from 'three';

/**
 * Interface representing cursor data.
 */
export interface WebXCursorData {
  xHot: number;
  yHot: number;
  cursorId: number;
  texture: Texture;
}

/**
 * Factory class for creating and managing cursor textures.
 * 
 * This class retrieves cursor textures based on cursor IDs and caches them
 * for reuse.
 */
export class WebXCursorFactory {
  private _cursorMap: Map<number, WebXCursorData> = new Map();

  constructor(private _tunnel: WebXTunnel) {}

  /**
   * Retrieves the cursor texture for the given cursor ID.
   * 
   * If the cursor texture is not already cached, it will be fetched and cached
   * for future use.
   * 
   * @param cursorId The ID of the cursor to retrieve.
   * @returns A promise that resolves to the cursor texture and its dimensions.
   */
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
