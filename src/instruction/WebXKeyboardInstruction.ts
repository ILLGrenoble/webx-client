import { WebXInstruction } from './WebXInstruction';
import { WebXInstructionType } from './WebXInstructionType';

/**
 * Represents an instruction to update the keyboard state in the WebX Engine.
 * 
 * This instruction is used to send key press or release events to the WebX Engine.
 */
export class WebXKeyboardInstruction extends WebXInstruction {
  /**
   * The key code of the key being pressed or released.
   */
  public readonly key: number;

  /**
   * Whether the key is being pressed (true) or released (false).
   */
  public readonly pressed: boolean;

  /**
   * Constructs a new WebXKeyboardInstruction.
   * 
   * @param key The key code of the key being pressed or released.
   * @param pressed Whether the key is being pressed (true) or released (false).
   */
  constructor(key: number, pressed: boolean) {
    super(WebXInstructionType.KEYBOARD);
    this.key = key;
    this.pressed = pressed;
  }
}
