import { WebXInstruction } from './WebXInstruction';
import { WebXInstructionType } from './WebXInstructionType';

/**
 * Represents an instruction to set the quality index in the WebX client.
 * 
 * This instruction is used to adjust the quality of the remote desktop display.
 * The quality index determines the quality of the images and the refresh rate of the windows.
 */
export class WebXQualityInstruction extends WebXInstruction {
  /**
   * The quality index to set.
   */
  public readonly qualityIndex: number;

  /**
   * Constructs a new WebXQualityInstruction.
   * 
   * @param qualityIndex The quality index to set.
   */
  constructor(qualityIndex: number) {
    super(WebXInstructionType.QUALITY);
    this.qualityIndex = qualityIndex;
  }
}
