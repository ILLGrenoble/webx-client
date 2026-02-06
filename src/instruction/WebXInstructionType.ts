/**
 * Enum representing the types of WebX instructions.
 *
 * These types are used to categorize instructions sent to the WebX Engine.
 */
export enum WebXInstructionType {

  /**
   * Instruction to connect to the WebX Engine.
   */
  CONNECT = 1,

  /**
   * Instruction to request visible window layout.
   */
  WINDOWS = 2,

  /**
   * Instruction to request window image data.
   */
  IMAGE = 3,

  /**
   * Instruction to request the screen settings.
   */
  SCREEN = 4,

  /**
   * Instruction to send a mouse event.
   */
  MOUSE = 5,

  /**
   * Instruction to send a keyboard event.
   */
  KEYBOARD = 6,

  /**
   * Instruction to request the cursor image.
   */
  CURSOR_IMAGE = 7,

  /**
   * Instruction to set the quality index.
   */
  QUALITY = 8,

  /**
   * Instruction to respond to a ping message.
   */
  PONG = 9,

  /**
   * Instruction to acknowledge data.
   */
  DATA_ACK = 10,

  /**
   * Instruction to send clipboard data to the WebX Engine.
   */
  CLIPBOARD = 11,

  /**
   * Instruction to request the window shape image (stencil image).
   */
  SHAPE = 12,

  /**
   * Instruction to request a screen resize
   */
  SCREEN_RESIZE = 13,
}

export namespace WebXInstructionType {
  /**
   * Converts a string representation of a WebX instruction type to its corresponding enum value.
   * @param value the string representation of the instruction type.
   * @returns the corresponding WebXInstructionType enum value.
   */
  export function fromString(value: string): WebXInstructionType {
    switch (value) {
      case 'CONNECT':
        return WebXInstructionType.CONNECT;
      case 'WINDOWS':
        return WebXInstructionType.WINDOWS;
      case 'IMAGE':
        return WebXInstructionType.IMAGE;
      case 'SCREEN':
        return WebXInstructionType.SCREEN;
      case 'MOUSE':
        return WebXInstructionType.MOUSE;
      case 'KEYBOARD':
        return WebXInstructionType.KEYBOARD;
      case 'CURSOR_IMAGE':
        return WebXInstructionType.CURSOR_IMAGE;
      case 'QUALITY':
        return WebXInstructionType.QUALITY;
      case 'PONG':
        return WebXInstructionType.PONG;
      case 'DATA_ACK':
        return WebXInstructionType.DATA_ACK;
      case 'CLIPBOARD':
        return WebXInstructionType.CLIPBOARD;
      case 'SHAPE':
        return WebXInstructionType.SHAPE;
      case 'SCREEN_RESIZE':
        return WebXInstructionType.SCREEN_RESIZE;
    }
  }
}
