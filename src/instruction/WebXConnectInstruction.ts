import { WebXInstruction } from './WebXInstruction';
import { WebXInstructionType } from './WebXInstructionType';

/**
 * Represents an instruction to establish a connection with the WebX Engine.
 * 
 * This instruction is used to initiate the connection process and send any
 * necessary connection parameters.
 */
export class WebXConnectInstruction extends WebXInstruction {
  /**
   * The connection parameters to be sent with the instruction.
   */
  public readonly parameters: any;

  /**
   * Constructs a new WebXConnectInstruction.
   * 
   * @param parameters The connection parameters.
   */
  constructor(parameters: any) {
    super(WebXInstructionType.CONNECT);
    this.parameters = parameters;
  }
}
