import { WebXInstruction } from './WebXInstruction';
import { WebXInstructionType } from './WebXInstructionType';

/**
 * This instruction is used to request a change in keyboards in the engine
 */
export class WebXKeyboardLayoutInstruction extends WebXInstruction {

  /**
   * The keyboard layout.
   */
  public readonly keyboardLayout: string;

  /**
   * Constructs a new WebXKeyboardLayoutInstruction.
   *
   * @param keyboardLayout The keyboard layout
   */
  constructor(keyboardLayout: string) {
    super(WebXInstructionType.KEYBOARD_LAYOUT);
    this.keyboardLayout = keyboardLayout;
  }
}
