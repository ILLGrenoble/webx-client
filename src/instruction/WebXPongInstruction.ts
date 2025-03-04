import { WebXInstruction } from './WebXInstruction';
import { WebXInstructionType } from './WebXInstructionType';

export class WebXPongInstruction extends WebXInstruction {
  constructor() {
    super(WebXInstructionType.PONG);
  }
}
