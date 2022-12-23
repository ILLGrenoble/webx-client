import { WebXInstruction } from './WebXInstruction';

export class WebXInstructionResponse<T> {
  private _onResponseReceived: (message: T) => void;
  private _onError: (error: Error) => void;
  private _timeoutMs: number;
  private readonly _timeoutId: number = 0;

  constructor(private _instruction: WebXInstruction, timeoutMs?: number) {
    if (timeoutMs) {
      this._timeoutMs = timeoutMs;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this._timeoutId = setTimeout(() => {
        this.reject('Request failed due to timeout');
      }, this._timeoutMs);
    }
  }

  then(onResponseReceived: (message: T) => void): WebXInstructionResponse<T> {
    this._onResponseReceived = onResponseReceived;
    return this;
  }

  catch(onError: (error: Error) => void): WebXInstructionResponse<T> {
    this._onError = onError;

    return this;
  }

  resolve(message: T): void {
    if (this._timeoutId > 0) {
      clearTimeout(this._timeoutId);
    }
    if (this._onResponseReceived != null) {
      this._onResponseReceived(message);
    }
  }

  reject(error: string): void {
    if (this._onError) {
      this._onError(new Error(error));
    }
  }
}
