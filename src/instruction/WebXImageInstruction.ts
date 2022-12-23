import { WebXInstruction } from './WebXInstruction';
import { WebXInstructionType } from './WebXInstructionType';

export class WebXImageInstruction extends WebXInstruction {
  private _windowId: number;

  public get windowId(): number {
    return this._windowId;
  }

  public set windowId(windowId: number) {
    this._windowId = windowId;
  }

  constructor(windowId: number) {
    super(WebXInstructionType.IMAGE);
    this._windowId = windowId;
  }
}
