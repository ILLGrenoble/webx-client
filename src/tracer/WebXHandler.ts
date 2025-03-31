/**
 * Interface for handling WebX events.
 * 
 * Implementations of this interface are responsible for processing WebX events
 * and providing a mechanism to clean up resources when no longer needed.
 */
export interface WebXHandler {
  /**
   * Cleans up resources associated with the handler.
   * 
   * This method should be called when the handler is no longer needed.
   */
  destroy(): void;
}
