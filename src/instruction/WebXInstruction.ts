import { WebXInstructionType } from './WebXInstructionType';

/**
 * Base class for all WebX instructions.
 * 
 * Instructions are either commands sent to the WebX Engine to perform specific actions or responses to messages from the engine.
 * Commands include connecting the engine, requesting window layout, handling input, requesting window image data.
 * Responses include acknowledging received data or ping messages.
 */
export abstract class WebXInstruction {
  private static _INSTRUCTION_COUNTER = 1;
  
  /**
   * The unique ID of the instruction.
   */
  public readonly id: number;
  
  /**
   * Indicates whether the instruction is synchronous or asynchronous.
   */
  public synchronous = false;

  /**
   * The type of the instruction.
   */
  public readonly type: WebXInstructionType;

  /**
   * Constructs a new WebXInstruction.
   * 
   * @param type The type of the instruction.
   */
  constructor(type: WebXInstructionType) {
    this.id = WebXInstruction._INSTRUCTION_COUNTER++;
    this.type = type;
  }
}
