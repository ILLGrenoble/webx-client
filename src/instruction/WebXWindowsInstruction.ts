import { WebXInstruction } from './WebXInstruction';
import { WebXInstructionType } from './WebXInstructionType';

export class WebXWindowsInstruction extends WebXInstruction {
  constructor() {
    super(WebXInstructionType.WINDOWS);
  }
}
