import { WebXInstruction } from './WebXInstruction';
import { WebXInstructionType } from './WebXInstructionType';

export class WebXPongInstruction extends WebXInstruction {

  get timestampMs(): Uint8Array {
    return this._timestampMs;
  }

  constructor(private readonly _timestampMs: Uint8Array) {
    super(WebXInstructionType.PONG);
  }
}
