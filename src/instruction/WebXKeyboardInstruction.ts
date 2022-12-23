import { WebXInstruction } from './WebXInstruction';
import { WebXInstructionType } from './WebXInstructionType';

export class WebXKeyboardInstruction extends WebXInstruction {
  private _key: number;
  private _pressed: boolean;

  public get key(): number {
    return this._key;
  }

  public set key(key: number) {
    this._key = key;
  }

  public get pressed(): boolean {
    return this._pressed;
  }

  public set pressed(pressed: boolean) {
    this._pressed = pressed;
  }

  constructor(key: number, pressed: boolean) {
    super(WebXInstructionType.KEYBOARD);
    this._key = key;
    this._pressed = pressed;
  }
}
