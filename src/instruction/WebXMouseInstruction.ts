import { WebXInstruction } from './WebXInstruction';
import { WebXInstructionType } from './WebXInstructionType';

export class WebXMouseInstruction extends WebXInstruction {
  private _x: number;
  private _y: number;
  private _buttonMask: number;

  public get x(): number {
    return this._x;
  }

  public set x(x: number) {
    this._x = x;
  }

  public get y(): number {
    return this._y;
  }

  public set y(y: number) {
    this._y = y;
  }

  public get buttonMask(): number {
    return this._buttonMask;
  }

  public set buttonMask(buttonMask: number) {
    this._buttonMask = buttonMask;
  }

  constructor(x: number, y: number, buttonMask: number) {
    super(WebXInstructionType.MOUSE);
    this._x = x;
    this._y = y;
    this._buttonMask = buttonMask;
  }
}
