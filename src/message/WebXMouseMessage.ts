import { WebXMessage } from './WebXMessage';
import { WebXMessageType } from './WebXMessageType';

/**
 * Represents a message containing mouse state updates.
 * 
 * This message is received from the WebX Engine and contains details about
 * the mouse position and cursor ID.
 */
export class WebXMouseMessage extends WebXMessage {
  /**
   * The x-coordinate of the mouse pointer.
   */
  public readonly x: number;

  /**
   * The y-coordinate of the mouse pointer.
   */
  public readonly y: number;

  /**
   * The ID of the cursor associated with the mouse pointer.
   */
  public readonly cursorId: number;

  /**
   * Constructs a new WebXMouseMessage.
   * 
   * @param x The x-coordinate of the mouse pointer.
   * @param y The y-coordinate of the mouse pointer.
   * @param cursorId The ID of the cursor.
   * @param commandId The ID of the command associated with this message.
   */
  constructor(x: number, y: number, cursorId: number, commandId: number) {
    super(WebXMessageType.MOUSE, commandId);
    this.x = x;
    this.y = y;
    this.cursorId = cursorId;
  }
}
