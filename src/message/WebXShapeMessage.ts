import { WebXMessage } from './WebXMessage';
import { WebXMessageType } from './WebXMessageType';
import {WebXTexture} from "../texture";

/**
 * Represents a message containing image data for a window.
 *
 * This message is received from the WebX Engine and contains the color and
 * alpha textures for a specific window.
 */
export class WebXShapeMessage extends WebXMessage {
  /**
   * The ID of the window associated with this image.
   */
  public readonly windowId: number;

  /**
   * The stencil texture of the window.
   */
  public readonly stencilMap: WebXTexture;

  /**
   * The size of the image.
   */
  public readonly size: number;

  /**
   * Constructs a new WebXImageMessage.
   *
   * @param windowId The ID of the window.
   * @param stencilMap The stencil texture.
   * @param commandId The ID of the command associated with this message.
   * @param size The size of the image.
   */
  constructor(windowId: number, stencilMap: WebXTexture, commandId: number, size: number) {
    super(WebXMessageType.SHAPE, commandId);
    this.windowId = windowId;
    this.stencilMap = stencilMap;
    this.size = size;
  }
}
