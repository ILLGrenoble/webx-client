import { WebXMessage } from './WebXMessage';
import { WebXMessageType } from './WebXMessageType';

/**
 * This message is received from the WebX Engine when the screen is resized
 */
export class WebXScreenResizeMessage extends WebXMessage {
  /**
   * The size of the screen.
   */
  public readonly screenSize: { width: number; height: number };


  /**
   * Constructs a new WebXScreenResizeMessage.
   *
   * @param screenSize The size of the screen.
   */
  constructor(screenSize: { width: number; height: number }) {
    super(WebXMessageType.SCREEN_RESIZE);
    this.screenSize = screenSize;
  }
}
