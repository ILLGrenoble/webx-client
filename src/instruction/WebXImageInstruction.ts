import { WebXInstruction } from './WebXInstruction';
import { WebXInstructionType } from './WebXInstructionType';

/**
 * Represents an instruction to request an image for a specific window.
 * 
 * This instruction is used to fetch the image data for a window from the WebX Engine.
 */
export class WebXImageInstruction extends WebXInstruction {
  /**
   * The ID of the window for which the image is requested.
   */
  public readonly windowId: number;

  /**
   * Constructs a new WebXImageInstruction.
   * 
   * @param windowId The ID of the window.
   */
  constructor(windowId: number) {
    super(WebXInstructionType.IMAGE);
    this.windowId = windowId;
  }
}
