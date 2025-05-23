import { WebXInstruction } from './WebXInstruction';
import { WebXInstructionType } from './WebXInstructionType';

/**
 * Represents an instruction to request a shape image for a specific window (stencil image).
 *
 * This instruction is used to fetch the stencil image data for a window from the WebX Engine.
 */
export class WebXShapeInstruction extends WebXInstruction {
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
    super(WebXInstructionType.SHAPE);
    this.windowId = windowId;
  }
}
