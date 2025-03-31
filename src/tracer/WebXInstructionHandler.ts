import { WebXInstruction } from '../instruction';

/**
 * Interface for handling WebX instructions.
 * 
 * Implementations of this interface are responsible for processing WebX instructions
 * and providing a mechanism to clean up resources when no longer needed.
 */
export abstract class WebXInstructionHandler {
  /**
   * Processes a WebX instruction.
   * 
   * @param instruction The WebX instruction to process.
   */
  abstract handle(instruction: WebXInstruction): void;

  /**
   * Cleans up resources associated with the handler.
   * 
   * This method should be called when the handler is no longer needed.
   */
  abstract destroy(): void;
}
