import { WebXInstruction } from './WebXInstruction';
import { WebXInstructionType } from './WebXInstructionType';

export class WebXCursorImageInstruction extends WebXInstruction {

  get cursorId(): number {
    return this._cursorId;
  }

  constructor(private _cursorId: number = 0) {
    super(WebXInstructionType.CURSOR_IMAGE);
  }
}
