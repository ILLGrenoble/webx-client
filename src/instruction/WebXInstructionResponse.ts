import { WebXInstruction } from './WebXInstruction';

/**
 * Represents a response to a WebX instruction.
 * 
 * This class encapsulates the result of executing an instruction, including
 * any data returned by the WebX Engine.
 */
export class WebXInstructionResponse<T> {
  /**
   * The ID of the instruction that this response corresponds to.
   */
  public readonly instructionId: number;

  /**
   * The data returned by the WebX Engine in response to the instruction.
   */
  public readonly data: any;

  /**
   * The callback to be invoked when a response is received.
   */
  private _onResponseReceived: (message: T) => void;

  /**
   * The callback to be invoked when an error occurs.
   */
  private _onError: (error: Error) => void;

  /**
   * The timeout duration in milliseconds.
   */
  private _timeoutMs: number;

  /**
   * The ID of the timeout.
   */
  private readonly _timeoutId: number = 0;

  /**
   * Constructs a new WebXInstructionResponse.
   * 
   * @param instruction The WebX instruction associated with this response.
   * @param timeoutMs The timeout duration in milliseconds.
   */
  constructor(instruction: WebXInstruction, timeoutMs?: number) {
    this.instructionId = instruction.id;
    this.data = null;

    if (timeoutMs) {
      this._timeoutMs = timeoutMs;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this._timeoutId = setTimeout(() => {
        this.reject('Request failed due to timeout');
      }, this._timeoutMs);
    }
  }

  /**
   * Registers a callback to be invoked when a response is received.
   * 
   * @param onResponseReceived The callback to be invoked.
   * @returns The current instance of WebXInstructionResponse.
   */
  then(onResponseReceived: (message: T) => void): WebXInstructionResponse<T> {
    this._onResponseReceived = onResponseReceived;
    return this;
  }

  /**
   * Registers a callback to be invoked when an error occurs.
   * 
   * @param onError The callback to be invoked.
   * @returns The current instance of WebXInstructionResponse.
   */
  catch(onError: (error: Error) => void): WebXInstructionResponse<T> {
    this._onError = onError;
    return this;
  }

  /**
   * Resolves the response with the provided message.
   * 
   * @param message The response message.
   */
  resolve(message: T): void {
    if (this._timeoutId > 0) {
      clearTimeout(this._timeoutId);
    }
    if (this._onResponseReceived != null) {
      this._onResponseReceived(message);
    }
  }

  /**
   * Rejects the response with the provided error message.
   * 
   * @param error The error message.
   */
  reject(error: string): void {
    if (this._onError) {
      this._onError(new Error(error));
    }
  }
}
