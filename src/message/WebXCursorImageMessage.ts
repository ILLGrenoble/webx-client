import { WebXMessage } from './WebXMessage';
import { WebXMessageType } from './WebXMessageType';
import {WebXTexture} from "../texture";

/**
 * Represents a message containing cursor image data.
 *
 * This message is received from the WebX Engine and contains details about
 * the cursor's appearance, including its texture and hotspot coordinates.
 */
export class WebXCursorImageMessage extends WebXMessage {
  /**
   * The ID of the cursor associated with this message.
   */
  public readonly cursorId: number;

  /**
   * The x-coordinate of the cursor's hotspot.
   */
  public readonly xHot: number;

  /**
   * The y-coordinate of the cursor's hotspot.
   */
  public readonly yHot: number;

  /**
   * The texture of the cursor.
   */
  public readonly texture: WebXTexture;

  /**
   * The x-coordinate of the cursor's position.
   */
  public readonly x: number;

  /**
   * The y-coordinate of the cursor's position.
   */
  public readonly y: number;

  /**
   * Constructs a new WebXCursorImageMessage.
   *
   * @param cursorId The ID of the cursor.
   * @param xHot The x-coordinate of the cursor's hotspot.
   * @param yHot The y-coordinate of the cursor's hotspot.
   * @param texture The texture of the cursor.
   * @param x The x-coordinate of the cursor's position.
   * @param y The y-coordinate of the cursor's position.
   * @param commandId The ID of the command associated with this message.
   */
  constructor(x: number, y: number, xHot: number, yHot: number, cursorId: number, texture: WebXTexture, commandId: number) {
    super(WebXMessageType.CURSOR_IMAGE, commandId);
    this.x = x;
    this.y = y;
    this.xHot = xHot;
    this.yHot = yHot;
    this.cursorId = cursorId;
    this.texture = texture;
  }
}
