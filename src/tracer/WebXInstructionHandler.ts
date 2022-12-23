import { WebXInstruction } from '../instruction';

export abstract class WebXInstructionHandler {
  abstract handle(instruction: WebXInstruction): void;

}
