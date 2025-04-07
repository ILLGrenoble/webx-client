import { WebXInstruction } from './WebXInstruction';
import { WebXInstructionType } from './WebXInstructionType';

/**
 * Represents an instruction to send clipboard data to the WebX Engine.
 *
 * This instruction is used to notify the WebX Engine that clipboard data has been set.
 */
export class WebXClipboardInstruction extends WebXInstruction {

  /**
   * The clipboard content.
   */
  public readonly clipboardContent: string;

  /**
   * Constructs a new WebXClipboardInstruction.
   *
   * @param clipboardContent The clipboard content.
   */
  constructor(clipboardContent: string) {
    super(WebXInstructionType.CLIPBOARD);
    this.clipboardContent = clipboardContent;
  }
}
