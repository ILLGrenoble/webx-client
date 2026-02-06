import {
  WebXConnectInstruction,
  WebXCursorImageInstruction,
  WebXImageInstruction,
  WebXInstruction,
  WebXInstructionType,
  WebXKeyboardInstruction,
  WebXMouseInstruction,
  WebXScreenInstruction,
  WebXWindowsInstruction,
  WebXQualityInstruction,
  WebXPongInstruction,
  WebXDataAckInstruction,
  WebXClipboardInstruction,
  WebXShapeInstruction, WebXScreenResizeInstruction,
} from '../instruction';
import {WebXInstructionBuffer} from "./WebXInstructionBuffer";

/**
 * Encodes WebX instructions into a format suitable for transmission.
 * This class handles various instruction types and ensures they are
 * serialized correctly.
 */
export class WebXInstructionEncoder {

  /**
   * Convert the given instruction to an array buffer ready to be sent along the wire
   * @param instruction the instruction to encode
   * @returns The encoded instruction as an ArrayBuffer.
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

    } else if (instruction.type === WebXInstructionType.PONG) {
      return this._createPongInstruction(instruction as WebXPongInstruction);

    } else if (instruction.type === WebXInstructionType.DATA_ACK) {
      return this._createDataAckInstruction(instruction as WebXDataAckInstruction);

    } else if (instruction.type === WebXInstructionType.CLIPBOARD) {
      return this._createClipboardInstruction(instruction as WebXClipboardInstruction);

    } else if (instruction.type === WebXInstructionType.SHAPE) {
      return this._createShapeInstruction(instruction as WebXShapeInstruction);

    } else if (instruction.type === WebXInstructionType.SCREEN_RESIZE) {
      return this._createScreenResizeInstruction(instruction as WebXScreenResizeInstruction);
    }
    return null;
  }

  /**
   * Create a new mouse instruction
   * @param instruction the mouse instruction to encode
   * Structure:
   *   Header: 32 bytes
   *    sessionId: 16 bytes
   *    clientId:4 bytes
   *    type: 4 bytes
   *    id: 4 bytes
   *    padding: 4 bytes
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
   *   Header: 32 bytes
   *    sessionId: 16 bytes
   *    clientId:4 bytes
   *    type: 4 bytes
   *    id: 4 bytes
   *    padding: 4 bytes
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
   *   Header: 32 bytes
   *    sessionId: 16 bytes
   *    clientId:4 bytes
   *    type: 4 bytes
   *    id: 4 bytes
   *    padding: 4 bytes
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
   *   Header: 32 bytes
   *    sessionId: 16 bytes
   *    clientId: 4 bytes
   *    type: 4 bytes
   *    id: 4 bytes
   *    padding: 4 bytes
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
   *   Header: 32 bytes
   *    sessionId: 16 bytes
   *    clientId: 4 bytes
   *    type: 4 bytes
   *    id: 4 bytes
   *    padding: 4 bytes
   */
  private _createScreenInstruction(instruction: WebXScreenInstruction): ArrayBuffer {
    const encoder = new WebXInstructionBuffer(instruction, 0);
    return encoder.buffer();
  }

  /**
   * Create a windows instruction
   * Structure:
   *   Header: 32 bytes
   *    sessionId: 16 bytes
   *    clientId: 4 bytes
   *    type: 4 bytes
   *    id: 4 bytes
   *    padding: 4 bytes
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
   *   Header: 32 bytes
   *    sessionId: 16 bytes
   *    clientId: 4 bytes
   *    type: 4 bytes
   *    id: 4 bytes
   *    padding: 4 bytes
   */
  private _createConnectInstruction(instruction: WebXConnectInstruction): ArrayBuffer {
    const encoder = new WebXInstructionBuffer(instruction, 0);
    return encoder.buffer();
  }


  /**
   * Create a new quality instruction
   * @param instruction the quality instruction to encode
   * Structure:
   *   Header: 32 bytes
   *    sessionId: 16 bytes
   *    clientId: 4 bytes
   *    type: 4 bytes
   *    id: 4 bytes
   *    padding: 4 bytes
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

  /**
   * Create a new pong instruction
   * @param instruction the pong instruction to encode
   * Structure:
   *   Header: 32 bytes
   *    sessionId: 16 bytes
   *    clientId: 4 bytes
   *    type: 4 bytes
   *    id: 4 bytes
   *    padding: 4 bytes
   *   Content: 8 bytes
   *     timestampMs: 8 bytes
   */
  private _createPongInstruction(instruction: WebXPongInstruction): ArrayBuffer {
    const encoder = new WebXInstructionBuffer(instruction, 8);
    return encoder
      // write the contents
      .putUInt8Array(instruction.timestampMs, 8)
      .buffer();
  }

  /**
   * Create a new data ack instruction
   * @param instruction the data ack instruction to encode
   * Structure:
   *   Header: 32 bytes
   *    sessionId: 16 bytes
   *    clientId: 4 bytes
   *    type: 4 bytes
   *    id: 4 bytes
   *    padding: 4 bytes
   *   Content: 8 bytes
   *     timestampMs: 8 bytes
   *     dataLength: 4 bytes
   */
  private _createDataAckInstruction(instruction: WebXDataAckInstruction): ArrayBuffer {
    const encoder = new WebXInstructionBuffer(instruction, 12);
    return encoder
      // write the contents
      .putUInt8Array(instruction.timestampMs, 8)
      .putUInt32(instruction.dataLength)
      .buffer();
  }

  /**
   * Create a new clipboard instruction
   * @param instruction the clipboard instruction to encode
   * Structure:
   *   Header: 32 bytes
   *    sessionId: 16 bytes
   *    clientId: 4 bytes
   *    type: 4 bytes
   *    id: 4 bytes
   *    padding: 4 bytes
   *   Content:
   *     clipboardContentLength: 4 bytes
   *     clipboardContent: N bytes
   */
  private _createClipboardInstruction(instruction: WebXClipboardInstruction): ArrayBuffer {
    const length = 4 + instruction.clipboardContent.length;
    const encoder = new WebXInstructionBuffer(instruction, length);
    return encoder
      // write the contents
      .putUInt32(instruction.clipboardContent.length)
      .putString(instruction.clipboardContent)
      .buffer();
  }

  /**
   * Create a new shape instruction
   * @param instruction the shape instruction to encode
   * Structure:
   *   Header: 32 bytes
   *    sessionId: 16 bytes
   *    clientId: 4 bytes
   *    type: 4 bytes
   *    id: 4 bytes
   *    padding: 4 bytes
   *   Content: 4 bytes
   *    windowId: 4 bytes
   */
  private _createShapeInstruction(instruction: WebXShapeInstruction): ArrayBuffer {
    const encoder = new WebXInstructionBuffer(instruction, 4);
    return encoder
      // write the contents
      .putUInt32(instruction.windowId)
      .buffer();
  }

  /**
   * Create a new shape instruction
   * @param instruction the shape instruction to encode
   * Structure:
   *   Header: 32 bytes
   *    sessionId: 16 bytes
   *    clientId: 4 bytes
   *    type: 4 bytes
   *    id: 4 bytes
   *    padding: 4 bytes
   *   Content: 4 bytes
   *     width: 4 bytes
   *     height: 4 bytes
   */
  private _createScreenResizeInstruction(instruction: WebXScreenResizeInstruction) {
    const encoder = new WebXInstructionBuffer(instruction, 8);
    return encoder
      // write the contents
      .putUInt32(instruction.width)
      .putUInt32(instruction.height)
      .buffer();
  }
}
