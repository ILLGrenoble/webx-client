import { WebXInstruction } from './WebXInstruction';
import { WebXInstructionType } from './WebXInstructionType';

/**
 * Represents an instruction to respond to a ping from the WebX Engine.
 * 
 * This instruction is used to acknowledge a ping and maintain the connection.
 */
export class WebXPongInstruction extends WebXInstruction {
  /**
   * The timestamp in milliseconds (copied from the message from the engine).
   */
  public readonly timestampMs: Uint8Array;

  /**
   * Constructs a new WebXPongInstruction.
   * 
   * @param timestampMs The timestamp in milliseconds.
   */
  constructor(timestampMs: Uint8Array) {
    super(WebXInstructionType.PONG);
    this.timestampMs = timestampMs;
  }
}
