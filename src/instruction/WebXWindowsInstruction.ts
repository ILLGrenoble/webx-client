import { WebXInstruction } from './WebXInstruction';
import { WebXInstructionType } from './WebXInstructionType';

/**
 * Represents an instruction to request the list of visible windows.
 * 
 * This instruction is used to fetch information about all currently visible
 * windows from the WebX Engine.
 */
export class WebXWindowsInstruction extends WebXInstruction {
  /**
   * Constructs a new WebXWindowsInstruction.
   */
  constructor() {
    super(WebXInstructionType.WINDOWS);
  }
}
