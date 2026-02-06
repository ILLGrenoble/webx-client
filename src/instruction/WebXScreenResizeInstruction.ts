import { WebXInstruction } from './WebXInstruction';
import { WebXInstructionType } from './WebXInstructionType';

/**
 * Represents an instruction to request a screen resize
 */
export class WebXScreenResizeInstruction extends WebXInstruction {
  /**
   * The requested width of the screen.
   */
  public readonly width: number;

  /**
   * The requested height of the screen.
   */
  public readonly height: number;

  /**
   * Constructs a new WebXScreenResizeInstruction.
   *
   * @param width The requested width of the screen
   * @param height The requested height of the screen
   */
  constructor(width: number, height: number) {
    super(WebXInstructionType.SCREEN_RESIZE);
    this.width = width;
    this.height = height;
  }
}
