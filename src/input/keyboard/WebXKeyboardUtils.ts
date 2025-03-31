/**
 * Utility class for keyboard-related operations.
 * 
 * This class provides methods to map characters to keysyms and determine
 * whether a key is repeatable.
 */
export class WebXKeyboardUtils {
  /**
   * Maps a Unicode character code to its corresponding X11 keysym.
   * 
   * @param codepoint The Unicode character code.
   * @returns The corresponding X11 keysym.
   */
  public static keysymFromCharCode(codepoint: number): number {
    const isControlCharacter = (char: number) => {
      return char <= 0x1f || (char >= 0x7f && char <= 0x9f);
    };

    // Keysyms for control characters
    if (isControlCharacter(codepoint)) {
      return 0xff00 | codepoint;
    }

    // Keysyms for ASCII chars
    if (codepoint >= 0x0000 && codepoint <= 0x00ff) {
      return codepoint;
    }

    // Keysyms for Unicode
    if (codepoint >= 0x0100 && codepoint <= 0x10ffff) {
      // return 0x01000000 | codepoint;
      return codepoint;
    }

    return null;
  }

  public static NON_REPEATABLE_KEYS: Array<number> = [
    0xfe03, // ISO Level 3 Shift (AltGr)
    0xffe1, // Left shift
    0xffe2, // Right shift
    0xffe3, // Left ctrl
    0xffe4, // Right ctrl
    0xffe5, // Caps Lock
    0xffe7, // Left meta
    0xffe8, // Right meta
    0xffe9, // Left alt
    0xffea, // Right alt
    0xffeb, // Left hyper
    0xffec // Right hyper
  ];

  /**
   * Determines whether a key is repeatable.
   * 
   * Modifier keys (e.g., Shift, Ctrl, Alt) are not repeatable.
   * 
   * @param keysym The keysym of the key to check.
   * @returns True if the key is repeatable, false otherwise.
   */
  public static isKeyRepeatable(keySymbol: number): boolean {
    const NON_REPEATABLE_KEYS = WebXKeyboardUtils.NON_REPEATABLE_KEYS;
    return !NON_REPEATABLE_KEYS[keySymbol];
  }
}

