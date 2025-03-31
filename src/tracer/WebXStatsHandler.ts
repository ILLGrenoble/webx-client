/**
 * Interface for handling WebX statistics.
 * 
 * Implementations of this interface are responsible for processing WebX statistics
 * and providing a mechanism to clean up resources when no longer needed.
 */
export abstract class WebXStatsHandler {
  /**
   * Processes WebX statistics.
   * 
   * @param stats The WebX statistics to process.
   */
  abstract handle(stats: { received: number; sent: number }): void;

  /**
   * Cleans up resources associated with the handler.
   * 
   * This method should be called when the handler is no longer needed.
   */
  abstract destroy(): void;
}
