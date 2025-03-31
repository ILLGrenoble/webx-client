import { WebXMessage } from '../message';

/**
 * Abstract class for handling WebX messages.
 * 
 * Implementations of this class are responsible for processing WebX messages
 * and providing a mechanism to clean up resources when no longer needed.
 */
export abstract class WebXMessageHandler {
  /**
   * Processes a WebX message.
   * 
   * @param message The WebX message to process.
   */
  abstract handle(message: WebXMessage): void;

  /**
   * Cleans up resources associated with the handler.
   * 
   * This method should be called when the handler is no longer needed.
   */
  abstract destroy(): void;
}
