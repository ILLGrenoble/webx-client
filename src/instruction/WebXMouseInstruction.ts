import { WebXInstruction } from './WebXInstruction';
import { WebXInstructionType } from './WebXInstructionType';

/**
 * Represents an instruction to update the mouse state in the WebX Engine.
 * 
 * This instruction is used to send mouse movement or button state changes to the WebX Engine.
 */
export class WebXMouseInstruction extends WebXInstruction {
  /**
   * The x-coordinate of the mouse pointer.
   */
  public readonly x: number;

  /**
   * The y-coordinate of the mouse pointer.
   */
  public readonly y: number;

  /**
   * The button mask representing the state of mouse buttons.
   */
  public readonly buttonMask: number;

  /**
   * Constructs a new WebXMouseInstruction.
   * 
   * @param x The x-coordinate of the mouse pointer.
   * @param y The y-coordinate of the mouse pointer.
   * @param buttonMask The button mask representing the state of mouse buttons.
   */
  constructor(x: number, y: number, buttonMask: number) {
    super(WebXInstructionType.MOUSE);
    this.x = x;
    this.y = y;
    this.buttonMask = buttonMask;
  }
}
