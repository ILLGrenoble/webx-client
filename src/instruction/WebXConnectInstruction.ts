import { WebXInstruction } from './WebXInstruction';
import { WebXInstructionType } from './WebXInstructionType';

export class WebXConnectInstruction extends WebXInstruction {
  constructor() {
    super(WebXInstructionType.CONNECT);
  }
}
