import { WebXMessageType } from './WebXMessageType';

/**
 * Base class for all WebX messages.
 *
 * Messages are data structures received from the WebX Engine, containing
 * information about the state of the remote desktop or responses to instructions.
 */
export abstract class WebXMessage {
  /**
   * The type of the message.
   */
  public readonly type: WebXMessageType;

  /**
   * The ID of the command associated with this message.
   */
  public readonly commandId: number;

  /**
   * Constructs a new WebXMessage.
   *
   * @param type The type of the message.
   * @param commandId The ID of the command associated with this message.
   */
  protected constructor(type: WebXMessageType, commandId: number = 0) {
    this.type = type;
    this.commandId = commandId;
  }
}
