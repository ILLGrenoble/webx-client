import { WebXMessage } from './WebXMessage';
import { WebXMessageType } from './WebXMessageType';
import {WebXTexture} from "../texture";

/**
 * Represents a message containing image data for a window.
 *
 * This message is received from the WebX Engine and contains the color and
 * alpha textures for a specific window.
 */
export class WebXImageMessage extends WebXMessage {
  /**
   * The ID of the window associated with this image.
   */
  public readonly windowId: number;

  /**
   * The depth of the image (e.g., 24-bit or 32-bit).
   */
  public readonly depth: number;

  /**
   * The color texture of the image.
   */
  public readonly colorMap: WebXTexture;

  /**
   * The alpha texture of the image.
   */
  public readonly alphaMap: WebXTexture;

  /**
   * The size of the image.
   */
  public readonly size: number;

  /**
   * Constructs a new WebXImageMessage.
   *
   * @param windowId The ID of the window.
   * @param depth The depth of the image.
   * @param colorMap The color texture.
   * @param alphaMap The alpha texture.
   * @param commandId The ID of the command associated with this message.
   * @param size The size of the image.
   */
  constructor(windowId: number, depth: number, colorMap: WebXTexture, alphaMap: WebXTexture, commandId: number, size: number) {
    super(WebXMessageType.IMAGE, commandId);
    this.windowId = windowId;
    this.depth = depth;
    this.colorMap = colorMap;
    this.alphaMap = alphaMap;
    this.size = size;
  }
}
