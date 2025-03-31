import { WebXInstruction } from './WebXInstruction';
import { WebXInstructionType } from './WebXInstructionType';

/**
 * Represents an instruction to request a cursor image.
 * 
 * This instruction is used to fetch the cursor image data from the WebX Engine.
 */
export class WebXCursorImageInstruction extends WebXInstruction {
  /**
   * The ID of the cursor for which the image is requested.
   */
  public readonly cursorId: number;

  /**
   * Constructs a new WebXCursorImageInstruction.
   * 
   * @param cursorId The ID of the cursor.
   */
  constructor(cursorId: number) {
    super(WebXInstructionType.CURSOR_IMAGE);
    this.cursorId = cursorId;
  }
}
