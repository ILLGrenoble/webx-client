import {WebXTunnel} from '../tunnel';
import {WebXImageInstruction, WebXShapeInstruction} from '../instruction';
import {WebXImageMessage, WebXShapeMessage} from '../message';
import {WebXTexture} from "../texture";

/**
 * Factory class for request textures for WebX windows.
 *
 * This class retrieves textures from the WebX Engine
 */
export class WebXWindowImageFactory {

  constructor(private _tunnel: WebXTunnel) {}

  /**
   * Retrieves the textures (colorMap and alphaMap) for a specific window ID from the WebX Engine.
   *
   * @param windowId The ID of the window to retrieve the texture for.
   * @returns A promise that resolves to the textures and associated data.
   */
  public async getWindowTexture(windowId: number): Promise<{ depth: number; colorMap: WebXTexture; alphaMap: WebXTexture }> {
    try {
      const response = await this._tunnel.sendRequest(new WebXImageInstruction(windowId)) as WebXImageMessage;
      return {
        depth: response.depth,
        colorMap: response.colorMap,
        alphaMap: response.alphaMap,
      };

    } catch (err) {
      console.warn('Failed to get texture: ' + err);
    }
  }

  /**
   * Retrieves the stencil textures for a specific window ID from the WebX Engine.
   *
   * @param windowId The ID of the window to retrieve the texture for.
   * @returns A promise that resolves to the stencil texture
   */
  public async getWindowStencilTexture(windowId: number): Promise<{ stencilMap: WebXTexture }> {
    try {
      const response = await this._tunnel.sendRequest(new WebXShapeInstruction(windowId)) as WebXShapeMessage;
      return {
        stencilMap: response.stencilMap,
      };

    } catch (err) {
      console.warn('Failed to get stencil texture: ' + err);
      return null;
    }
  }
}
