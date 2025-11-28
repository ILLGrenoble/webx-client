import {WebXInstructionHandler} from "./WebXInstructionHandler";
import {WebXHandler} from "./WebXHandler";
import {WebXInstruction, WebXInstructionType, WebXKeyboardInstruction} from "../instruction";

/**
 * Provides a callback method when a specific combination of keys is pressed.
 */
export class WebXKeyboardCombinationHandler extends WebXInstructionHandler implements WebXHandler {

  private _keys: number[] = [];

  constructor(private _combination: number[], private _callback: () => void) {
    super();
  }

  /**
   * Handles the instruction, recording key presses and determining if they match the provided combination. If they
   * do then the callback is called.
   * @param instruction The WebX instruction
   */
  handle(instruction: WebXInstruction): void {
    if (instruction.type === WebXInstructionType.KEYBOARD) {
      const keyboardInstruction = instruction as WebXKeyboardInstruction;
      if (keyboardInstruction.pressed) {
        this._keys.push(keyboardInstruction.key);
        if (this._keys.length > this._combination.length) {
          this._keys.shift();
        }
        if (this._keys.length == this._combination.length) {
          if (this._keys.every((key, index) => key === this._combination[index])) {
            this._callback();
          }
        }
      }
    }
  }

  /**
   * Called when removed to clean up any resources: not needed here.
   */
  destroy(): void {
    // do nothing
  }

}
