import { WebXInstruction } from './WebXInstruction';
import { WebXInstructionType } from './WebXInstructionType';

export class WebXScreenInstruction extends WebXInstruction {
  constructor() {
    super(WebXInstructionType.SCREEN);
  }
}
