import { WebXMessage } from './WebXMessage';
import { WebXMessageType } from './WebXMessageType';
import { WebXWindowProperties } from '../common';

/**
 * Represents a message containing information about visible windows.
 *
 * This message is received from the WebX Engine and contains details about
 * all currently visible windows.
 */
export class WebXWindowsMessage extends WebXMessage {
  /**
   * The list of visible windows.
   */
  public readonly windows: Array<WebXWindowProperties>;

  /**
   * Constructs a new WebXWindowsMessage.
   *
   * @param windows The list of visible windows.
   * @param commandId The ID of the command associated with this message.
   */
  constructor(windows: Array<WebXWindowProperties>, commandId: number) {
    super(WebXMessageType.WINDOWS, commandId);
    this.windows = windows;
  }
}
