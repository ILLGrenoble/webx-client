import { WebXInstructionType } from './WebXInstructionType';

export class WebXInstruction {
  private static _INSTRUCTION_COUNTER = 1;
  private readonly _id: number;
  private _synchronous = false;

  public get id(): number {
    return this._id;
  }

  public get type(): WebXInstructionType {
    return this._type;
  }

  public get synchronous(): boolean {
    return this._synchronous;
  }

  public set synchronous(value: boolean) {
    this._synchronous = value;
  }

  constructor(private _type: WebXInstructionType) {
    this._id = WebXInstruction._INSTRUCTION_COUNTER++;
  }

  toJsonString(): string {
    let json = JSON.stringify(this);
    Object.keys(this)
      .filter(key => key[0] === '_')
      .forEach(key => {
        json = json.replace(key, key.substring(1));
      });

    return json;
  }
}
