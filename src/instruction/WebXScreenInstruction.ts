import { WebXInstruction } from './WebXInstruction';
import { WebXInstructionType } from './WebXInstructionType';

/**
 * Represents an instruction to request screen information from the WebX Engine.
 * 
 * This instruction is used to retrieve the screen size.
 */
export class WebXScreenInstruction extends WebXInstruction {
  /**
   * Constructs a new WebXScreenInstruction.
   */
  constructor() {
    super(WebXInstructionType.SCREEN);
  }
}
