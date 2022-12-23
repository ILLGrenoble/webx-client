import { WebXInstruction } from './WebXInstruction';
import { WebXInstructionType } from './WebXInstructionType';

export class WebXQualityInstruction extends WebXInstruction {

  public get qualityIndex(): number {
    return this._qualityIndex;
  }

  public set qualityIndex(qualityIndex: number) {
    this._qualityIndex = qualityIndex;
  }

  constructor(private _qualityIndex: number) {
    super(WebXInstructionType.QUALITY);
  }
}
