export enum WebXInstructionType {
  CONNECT = 1,
  WINDOWS = 2,
  IMAGE = 3,
  SCREEN = 4,
  MOUSE = 5,
  KEYBOARD = 6,
  CURSOR_IMAGE = 7,
  QUALITY = 8,
}

export namespace WebXInstructionType {
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
    }
  }
}
