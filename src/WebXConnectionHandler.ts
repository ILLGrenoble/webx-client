export enum WebXConnectionStatus {
  STARTING, // Indicates the connection is starting
  RUNNING,  // Indicates the connection is running
}

export class WebXConnectionHandler {
  private _connected = false;
  private _timeout: number;
  private _timeoutMs: number;
  private _connectionCallback: () => void = () => {};
  private _connectionError: () => void = () => {};
  private _connectionStatusCallback: (status: number) => void = () => {};

  /**
   * Handles the connection process.
   * Sets up a timeout and resolves or rejects the promise based on connection status.
   *
   * @param timeoutMs Timeout duration in milliseconds.
   * @param connectionStatusCallback Callback to handle connection status updates.
   * @returns A promise that resolves when connected or rejects on timeout.
   */
  public onConnected(timeoutMs: number, connectionStatusCallback: (status: WebXConnectionStatus) => void): Promise<void> {
    this._timeoutMs = timeoutMs || 10000; // Default timeout is 10 seconds
    this._connectionStatusCallback = connectionStatusCallback;

    return new Promise<void>((resolve, reject) => {
      if (this._connected) {
        // If already connected, resolve immediately
        resolve();
      } else {
        // Set up callbacks for connection success and error
        this._connectionCallback = () => {
          window.clearTimeout(this._timeout);
          this._timeout = null;
          resolve();
        };

        this._connectionError = () => {
          this._timeout = null;
          reject(new Error("Connection timed out"));
        };

        this._createTimer();
      }
    });
  }

  /**
   * Updates the connection status.
   * Calls the appropriate status callback based on whether the connection is starting or running.
   *
   * @param isStarting Indicates if the connection is starting.
   */
  public setConnected(isStarting: boolean): void {
    if (isStarting) {
      // Notify that the connection is starting
      this._connectionStatusCallback(WebXConnectionStatus.STARTING);
    } else {
      // Mark the connection as established
      this._connected = true;
      this._connectionStatusCallback(WebXConnectionStatus.RUNNING);
      this._connectionCallback();
    }
  }

  /**
   * Resets the connection timeout timer.
   * Clears the existing timer and starts a new one.
   */
  public resetTimer(): void {
    if (this._timeout) {
      window.clearTimeout(this._timeout);
      this._timeout = null;
      this._createTimer();
    }
  }

  /**
   * Cleans up resources.
   * Clears the timeout if it exists.
   */
  public dispose(): void {
    if (this._timeout) {
      window.clearTimeout(this._timeout);
    }
  }

  /**
   * Creates a timeout timer.
   * Calls the connection error callback if the timer expires.
   */
  private _createTimer(): void {
    this._timeout = window.setTimeout(() => {
      this._connectionError();
    }, this._timeoutMs);
  }
}
