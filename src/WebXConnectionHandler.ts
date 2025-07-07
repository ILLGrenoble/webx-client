

export enum WebXConnectionStatus {
  STARTING,
  RUNNING,
}

export class WebXConnectionHandler {
  private _connected = false;
  private _timeout: number;
  private _timeoutMs: number;
  private _connectionCallback: () => void = () => {};
  private _connectionError: () => void = () => {};
  private _connectionStatusCallback: (status: number) => void = () => {};

  public onConnected(timeoutMs: number, connectionStatusCallback: (status: WebXConnectionStatus) => void): Promise<void> {
    this._timeoutMs = timeoutMs || 10000;
    this._connectionStatusCallback = connectionStatusCallback;

    return new Promise<void>((resolve, reject) => {
      if (this._connected) {
        resolve();
      } else {

        this._connectionCallback = () => {
          window.clearTimeout(this._timeout);
          this._timeout = null;
          resolve();
        }

        this._connectionError = () => {
          this._timeout = null;
          reject(new Error("Connection timed out"));
        }

        this._createTimer();
      }

    });
  }

  public setConnected(isStarting: boolean): void {
    if (isStarting) {
      this._connectionStatusCallback(WebXConnectionStatus.STARTING)

    } else {
      this._connected = true;
      this._connectionStatusCallback(WebXConnectionStatus.RUNNING)
      this._connectionCallback();
    }
  }

  public resetTimer(): void {
    if (this._timeout) {
      window.clearTimeout(this._timeout);
      this._timeout = null;
      this._createTimer();
    }
  }

  public dispose(): void {
    if (this._timeout) {
      window.clearTimeout(this._timeout);
    }
  }

  private _createTimer(): void {
    this._timeout = window.setTimeout(() => {
      this._connectionError();
    }, this._timeoutMs);
  }
}
