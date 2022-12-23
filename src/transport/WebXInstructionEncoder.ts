import {
  WebXConnectInstruction,
  WebXCursorImageInstruction,
  WebXImageInstruction,
  WebXInstruction,
  WebXInstructionType,
  WebXKeyboardInstruction,
  WebXMouseInstruction,
  WebXScreenInstruction,
  WebXWindowsInstruction
} from '../instruction';
import { WebXInstructionBuffer } from '.';
import { WebXQualityInstruction } from '../instruction/WebXQualityInstruction';

export class WebXInstructionEncoder {

  /**
   * Convert the given instruction to an array buffer ready to be sent along the wire
   * @param instruction the instruction to encode
   */
  public encode(instruction: WebXInstruction): ArrayBuffer {
    if (instruction.type === WebXInstructionType.MOUSE) {
      return this._createMouseInstruction(instruction as WebXMouseInstruction);

    } else if (instruction.type === WebXInstructionType.KEYBOARD) {
      return this._createKeyboardInstruction(instruction as WebXKeyboardInstruction);

    } else if (instruction.type === WebXInstructionType.CURSOR_IMAGE) {
      return this._createCursorImageInstruction(instruction as WebXCursorImageInstruction);

    } else if (instruction.type === WebXInstructionType.IMAGE) {
      return this._createImageInstruction(instruction as WebXImageInstruction);

    } else if (instruction.type === WebXInstructionType.CONNECT) {
      return this._createConnectInstruction(instruction as WebXConnectInstruction);

    } else if (instruction.type === WebXInstructionType.SCREEN) {
      return this._createScreenInstruction(instruction as WebXScreenInstruction);

    } else if (instruction.type === WebXInstructionType.WINDOWS) {
      return this._createWindowsInstruction(instruction as WebXWindowsInstruction);

    } else if (instruction.type === WebXInstructionType.QUALITY) {
      return this._createQualityInstruction(instruction as WebXQualityInstruction);
    }
    return null;
  }

  /**
   * Create a new mouse instruction
   * @param instruction the mouse instruction to encode
   * Structure:
   *   Header: 24 bytes
   *    sessionId: 16 bytes
   *    type: 4 bytes
   *    id: 4 bytes
   *   Content: 4 bytes
   *    x: 4 bytes
   *    y: 4 bytes
   *    buttonMask: 4 bytes
   */
  private _createMouseInstruction(instruction: WebXMouseInstruction): ArrayBuffer {
    const encoder = new WebXInstructionBuffer(instruction, 12);
    return encoder
      // write the contents
      .putInt32(instruction.x)
      .putInt32(instruction.y)
      .putUInt32(instruction.buttonMask)
      .buffer();
  }

  /**
   * Create a new cursor image instruction
   * @param instruction the cursor image instruction to encode
   * Structure:
   *   Header: 24 bytes
   *    sessionId: 16 bytes
   *    type: 4 bytes
   *    id: 4 bytes
   *   Content: 4 bytes
   *    cursorId: 4 bytes
   */
  private _createCursorImageInstruction(instruction: WebXCursorImageInstruction): ArrayBuffer {
    const encoder = new WebXInstructionBuffer(instruction, 4);
    return encoder
      // write the contents
      .putInt32(instruction.cursorId)
      .buffer();
  }

  /**
   * Create a new image instruction
   * @param instruction the image instruction to encode
   * Structure:
   *   Header: 24 bytes
   *    sessionId: 16 bytes
   *    type: 4 bytes
   *    id: 4 bytes
   *   Content: 4 bytes
   *    windowId: 4 bytes
   */
  private _createImageInstruction(instruction: WebXImageInstruction): ArrayBuffer {
    const encoder = new WebXInstructionBuffer(instruction, 4);
    return encoder
      // write the contents
      .putUInt32(instruction.windowId)
      .buffer();
  }

  /**
   * Create a keyboard instruction
   * @param instruction the keyboard instruction to encode
   * Structure:
   *   Header: 24 bytes
   *    sessionId: 16 bytes
   *    type: 4 bytes
   *    id: 4 bytes
   *   Content: 8 bytes
   *    key (the keyboard key code): 4 bytes
   *    pressed: 4 bytes
   */
  private _createKeyboardInstruction(instruction: WebXKeyboardInstruction): ArrayBuffer {
    const encoder = new WebXInstructionBuffer(instruction, 8);
    return encoder
      // write the contents
      .putUInt32(instruction.key)
      .putBoolean(instruction.pressed)
      .buffer();
  }

  /**
   * Create a screen instruction
   * @param instruction the screen instruction to encode
   * Structure:
   *   Header: 24 bytes
   *    sessionId: 16 bytes
   *    type: 4 bytes
   *    id: 4 bytes
   */
  private _createScreenInstruction(instruction: WebXScreenInstruction): ArrayBuffer {
    const encoder = new WebXInstructionBuffer(instruction, 0);
    return encoder.buffer();
  }

  /**
   * Create a windows instruction
   * Structure:
   *   Header: 24 bytes
   *    sessionId: 16 bytes
   *    type: 4 bytes
   *    id: 4 bytes
   * @param instruction the windows instruction to encode
   */
  private _createWindowsInstruction(instruction: WebXWindowsInstruction): ArrayBuffer {
    const encoder = new WebXInstructionBuffer(instruction, 0);
    return encoder.buffer();
  }

  /**
   * Create a connect instruction
   * @param instruction the connect instruction to encode
   * Structure:
   *   Header: 24 bytes
   *    sessionId: 16 bytes
   *    type: 4 bytes
   *    id: 4 bytes
   */
  private _createConnectInstruction(instruction: WebXConnectInstruction): ArrayBuffer {
    const encoder = new WebXInstructionBuffer(instruction, 0);
    return encoder.buffer();
  }


  /**
   * Create a new quality instruction
   * @param instruction the quality instruction to encode
   * Structure:
   *   Header: 24 bytes
   *    sessionId: 16 bytes
   *    type: 4 bytes
   *    id: 4 bytes
   *   Content: 4 bytes
   *    qualityIndex: 4 bytes
   */
  private _createQualityInstruction(instruction: WebXQualityInstruction): ArrayBuffer {
    const encoder = new WebXInstructionBuffer(instruction, 4);
    return encoder
      // write the contents
      .putUInt32(instruction.qualityIndex)
      .buffer();
  }

}
