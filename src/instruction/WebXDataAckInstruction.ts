import { WebXInstruction } from './WebXInstruction';
import { WebXInstructionType } from './WebXInstructionType';

/**
 * Represents an instruction to acknowledge received data.
 * 
 * This instruction is used to notify the WebX Engine that a specific amount
 * of data has been successfully received.
 */
export class WebXDataAckInstruction extends WebXInstruction {
  /**
   * The timestamp in milliseconds: timestamp originates from the message containing the sent the data (ie timestamp of
   * the WebX Engine).
   */
  public readonly timestampMs: Uint8Array;

  /**
   * The length of the data.
   */
  public readonly dataLength: number;

  /**
   * Constructs a new WebXDataAckInstruction.
   * 
   * @param timestampMs The timestamp in milliseconds.
   * @param dataLength The length of the data.
   */
  constructor(timestampMs: Uint8Array, dataLength: number) {
    super(WebXInstructionType.DATA_ACK);
    this.timestampMs = timestampMs;
    this.dataLength = dataLength;
  }
}
