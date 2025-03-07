import { WebXInstruction } from './WebXInstruction';
import { WebXInstructionType } from './WebXInstructionType';

export class WebXDataAckInstruction extends WebXInstruction {

  get timestampMs(): Uint8Array {
    return this._timestampMs;
  }

  get dataLength(): number {
    return this._dataLength;
  }

  constructor(private readonly _timestampMs: Uint8Array, private readonly _dataLength: number) {
    super(WebXInstructionType.DATA_ACK);
  }
}
