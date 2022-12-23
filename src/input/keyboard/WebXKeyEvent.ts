import { WebXKeyboardUtils } from './WebXKeyboardUtils';

/**
 * A key event having a corresponding timestamp. This event is non-specific.
 * Its subclasses should be used instead when recording specific key
 * events.
 */
export abstract class WebXKeyEvent {

  /**
 * Map of known JavaScript keyidentifiers which do not map to typable
 * characters to their unshifted X11 keysym equivalents.
 */
  public static keyidentifier_keysym: { [index: string]: Array<number> } = {
    Again: [0xff66],
    AllCandidates: [0xff3d],
    Alphanumeric: [0xff30],
    Alt: [0xffe9, 0xffe9, 0xfe03],
    Attn: [0xfd0e],
    AltGraph: [0xfe03],
    ArrowDown: [0xff54],
    ArrowLeft: [0xff51],
    ArrowRight: [0xff53],
    ArrowUp: [0xff52],
    Backspace: [0xff08],
    CapsLock: [0xffe5],
    Cancel: [0xff69],
    Clear: [0xff0b],
    Convert: [0xff21],
    Copy: [0xfd15],
    Crsel: [0xfd1c],
    CrSel: [0xfd1c],
    CodeInput: [0xff37],
    Compose: [0xff20],
    Control: [0xffe3, 0xffe3, 0xffe4],
    ContextMenu: [0xff67],
    Delete: [0xffff],
    Down: [0xff54],
    End: [0xff57],
    Enter: [0xff0d],
    EraseEof: [0xfd06],
    Escape: [0xff1b],
    Execute: [0xff62],
    Exsel: [0xfd1d],
    ExSel: [0xfd1d],
    F1: [0xffbe],
    F2: [0xffbf],
    F3: [0xffc0],
    F4: [0xffc1],
    F5: [0xffc2],
    F6: [0xffc3],
    F7: [0xffc4],
    F8: [0xffc5],
    F9: [0xffc6],
    F10: [0xffc7],
    F11: [0xffc8],
    F12: [0xffc9],
    F13: [0xffca],
    F14: [0xffcb],
    F15: [0xffcc],
    F16: [0xffcd],
    F17: [0xffce],
    F18: [0xffcf],
    F19: [0xffd0],
    F20: [0xffd1],
    F21: [0xffd2],
    F22: [0xffd3],
    F23: [0xffd4],
    F24: [0xffd5],
    Find: [0xff68],
    GroupFirst: [0xfe0c],
    GroupLast: [0xfe0e],
    GroupNext: [0xfe08],
    GroupPrevious: [0xfe0a],
    FullWidth: null,
    HalfWidth: null,
    HangulMode: [0xff31],
    Hankaku: [0xff29],
    HanjaMode: [0xff34],
    Help: [0xff6a],
    Hiragana: [0xff25],
    HiraganaKatakana: [0xff27],
    Home: [0xff50],
    Hyper: [0xffed, 0xffed, 0xffee],
    Insert: [0xff63],
    JapaneseHiragana: [0xff25],
    JapaneseKatakana: [0xff26],
    JapaneseRomaji: [0xff24],
    JunjaMode: [0xff38],
    KanaMode: [0xff2d],
    KanjiMode: [0xff21],
    Katakana: [0xff26],
    Left: [0xff51],
    Meta: [0xffe7, 0xffe7, 0xffe8],
    ModeChange: [0xff7e],
    NumLock: [0xff7f],
    PageDown: [0xff56],
    PageUp: [0xff55],
    Pause: [0xff13],
    Play: [0xfd16],
    PreviousCandidate: [0xff3e],
    PrintScreen: [0xff61],
    Redo: [0xff66],
    Right: [0xff53],
    RomanCharacters: null,
    Scroll: [0xff14],
    Select: [0xff60],
    Separator: [0xffac],
    Shift: [0xffe1, 0xffe1, 0xffe2],
    SingleCandidate: [0xff3c],
    Super: [0xffeb, 0xffeb, 0xffec],
    Tab: [0xff09],
    UIKeyInputDownArrow: [0xff54],
    UIKeyInputEscape: [0xff1b],
    UIKeyInputLeftArrow: [0xff51],
    UIKeyInputRightArrow: [0xff53],
    UIKeyInputUpArrow: [0xff52],
    Up: [0xff52],
    Undo: [0xff65],
    Win: [0xffeb],
    Zenkaku: [0xff28],
    ZenkakuHankaku: [0xff2a]
  };


  /**
   * Whether the default action of this key event should be prevented.
   */
  protected _defaultPrevented = false;

  /**
   * The keysym of the key associated with this key event, as determined
   * by a best-effort guess using available event properties and keyboard
   * state.
   */
  protected _keysym: number = null;

  /**
   * Whether the keysym value of this key event is known to be reliable.
   * If false, the keysym may still be valid, but it's only a best guess,
   * and future key events may be a better source of information.
   */
  protected _reliable = false;

  public get defaultPrevented(): boolean {
    return this._defaultPrevented;
  }

  public set defaultPrevented(defaultPrevented: boolean) {
    this._defaultPrevented = defaultPrevented;
  }

  public get keysym(): number {
    return this._keysym;
  }

  public set keysym(keysym: number) {
    this._keysym = keysym;
  }

  public get reliable(): boolean {
    return this._reliable;
  }

  public set reliable(reliable: boolean) {
    this._reliable = reliable;
  }

  /**
   * Returns true if the given keysym corresponds to a printable character,
   * false otherwise.
   *
   * @returns {Boolean}
   *     true if the given keysym corresponds to a printable character,
   *     false otherwise.
   */
  public isPrintable() {
    const keysym = this._keysym;
    // Keysyms with Unicode equivalents are printable
    return (keysym >= 0x00 && keysym <= 0xff) || (keysym & 0xffff0000) === 0x01000000;
  }

  public getKeysym(keysyms: Array<number>, location: number): number {
    if (!keysyms) {
      return null;
    }

    return keysyms[location] || keysyms[0];
  }


  public keysymFromKeyIdentifier(identifier: any, location: any, shifted?: any) {

    if (!identifier) {
      return null;
    }

    let typedCharacter: string;

    // If identifier is U+xxxx, decode Unicode character
    const unicodePrefixLocation = identifier.indexOf("U+");
    if (unicodePrefixLocation >= 0) {
      const hex = identifier.substring(unicodePrefixLocation + 2);
      typedCharacter = String.fromCharCode(parseInt(hex, 16));
    }

    // If single character and not keypad, use that as typed character
    else if (identifier.length === 1 && location !== 3) {
      typedCharacter = identifier;
    }

    // Otherwise, look up corresponding keysym
    else {
      return this.getKeysym(WebXKeyEvent.keyidentifier_keysym[identifier], location);
    }

    // Alter case if necessary
    if (shifted === true) {
      typedCharacter = typedCharacter.toUpperCase();
    }
    else if (shifted === false) {
      typedCharacter = typedCharacter.toLowerCase();
    }

    // Get codepoint
    const codepoint = typedCharacter.charCodeAt(0);
    return WebXKeyboardUtils.keysymFromCharCode(codepoint);

  }

}
