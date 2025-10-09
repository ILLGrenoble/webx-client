import { WebXInstruction } from '../instruction';
import { WebXMessage } from '../message';
import { WebXInstructionEncoder } from "./WebXInstructionEncoder";
import {WebXMessageDecoder} from "./WebXMessageDecoder";
import {isWorkerMessage, recastWebXMessage} from "./WebXMessageFunc";
import { WebXMessageBuffer } from "./WebXMessageBuffer";
import WebXMessageDecoderWorker from "web-worker:./WebXMessageDecoderWorker";

/**
 * Serializes and deserializes WebX instructions and messages.
 */
export class WebXBinarySerializer {

  private readonly _instructionEncoder: WebXInstructionEncoder;
  private readonly _messageDecoder: WebXMessageDecoder;

  private readonly _worker: Worker;
  private _pending = new Map<number, (message: WebXMessage) => void>();
  private _nextId = 1;

  /**
   * Creates a new instance of WebXBinarySerializer.
   */
  constructor() {
    this._instructionEncoder = new WebXInstructionEncoder();
    this._messageDecoder = new WebXMessageDecoder();
    if (typeof Worker !== 'undefined') {
      this._worker = new WebXMessageDecoderWorker();

      this._worker.onmessage = (e) => {
        const { id, message, error } = e.data;
        const callback = this._pending.get(id);
        this._pending.delete(id);

        if (error) {
          console.error(error);

        } else if (callback) {
          const webxMessage = recastWebXMessage(message);
          callback(webxMessage);
        }
      };
    }
  }

  /**
   * Terminates the Web Worker and clears pending tasks.
   */
  public terminate() {
    this._worker.terminate();
    this._pending.clear();
  }

  /**
   * Serializes a WebXInstruction into a binary ArrayBuffer.
   *
   * @param instruction The instruction to serialize.
   * @returns The serialized ArrayBuffer.
   */
  serializeInstruction(instruction: WebXInstruction): ArrayBuffer {
    // return instruction.toJsonString();
    const encoded = this._instructionEncoder.encode(instruction);
    if (encoded == null) {
      console.warn('Could not serialize instruction: Unknown type');
    }
    return encoded;
  }

  /**
   * Deserializes a binary message buffer into a WebXMessage object. A web worker is used if available
   * and the message should be decoded in a separate thread.
   *
   * @param messageBuffer The binary message buffer to deserialize.
   * @returns A promise that resolves to the deserialized WebXMessage.
   */
  async deserializeMessage(messageBuffer: WebXMessageBuffer): Promise<WebXMessage> {
    if (this._worker && isWorkerMessage(messageBuffer)) {
      return new Promise((resolve) => {
        const id = this._nextId++;
        this._pending.set(id, resolve);

        const transfers = [messageBuffer.buffer];

        this._worker.postMessage(
          { id, buffer: messageBuffer.buffer, convertToImageData: WebXMessage.convertToImageDataInWorker },
          transfers
        );

      });

    } else {
      try {
        const message = await this._messageDecoder.decode(messageBuffer);
        if (message == null) {
          console.error(`Failed to decode message data`);
        }
        return message;

      } catch (error) {
        console.error(`Caught error decoding message data: ${error.message}`);
      }
    }
  }

}
