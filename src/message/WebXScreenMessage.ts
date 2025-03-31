import { WebXMessage } from './WebXMessage';
import { WebXMessageType } from './WebXMessageType';

/**
 * Represents a message containing screen information.
 * 
 * This message is received from the WebX Engine and contains details about
 * the screen size.
 */
export class WebXScreenMessage extends WebXMessage {
  /**
   * The size of the screen.
   */
  public readonly screenSize: { width: number; height: number };

  /**
   * Constructs a new WebXScreenMessage.
   * 
   * @param screenSize The size of the screen.
   * @param commandId The ID of the command associated with this message.
   */
  constructor(screenSize: { width: number; height: number }, commandId: number) {
    super(WebXMessageType.SCREEN, commandId);
    this.screenSize = screenSize;
  }
}
