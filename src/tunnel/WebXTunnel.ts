import {WebXDataAckInstruction, WebXInstruction, WebXInstructionResponse, WebXPongInstruction} from '../instruction';
import {WebXMessage, WebXMessageType} from '../message';
import { WebXBinarySerializer, WebXMessageBuffer } from '../transport';
import { WebXQoSHandler } from './WebXQoSHandler';
import { WebXDefaultQoSHandler } from './WebXDefaultQoSHandler';

export abstract class WebXTunnel {
  private static readonly MIN_BUFFER_LENGTH_FOR_ACK = 32768;

  protected _serializer: WebXBinarySerializer;
  private _qosHandler: WebXQoSHandler = new WebXDefaultQoSHandler(this);

  private _instructionResponses: Map<number, WebXInstructionResponse<any>> = new Map<number, WebXInstructionResponse<any>>();

  protected constructor() {
    this._serializer = null;
  }

  abstract connect(data: any, serializer: WebXBinarySerializer): Promise<Event>;

  abstract disconnect(): void;

  abstract send(data: ArrayBuffer): void;

  sendInstruction(command: WebXInstruction): void {
    // console.log(`Sending command: `, command);
    const message = this._serializer.serializeInstruction(command);
    this.send(message);
  }

  sendRequest(command: WebXInstruction, timeout?: number): Promise<WebXMessage> {
    // console.log(`Sending request: `, command);
    command.synchronous = true;
    timeout = timeout || 10000;
    const response = new WebXInstructionResponse<WebXMessage>(command, timeout);
    this._instructionResponses.set(command.id, response);
    return new Promise((resolve, reject) => {
      const message = this._serializer.serializeInstruction(command);
      this.send(message);
      response
        .then(resolve)
        .catch((error: Error) => {
          this._instructionResponses.delete(command.id);
          reject(error);
        });
    });
  }

  protected async onMessage(data: ArrayBuffer): Promise<void> {
    if (data.byteLength === 0) {
      console.warn('Got a zero length message');
      return null;
    } else if (data.byteLength < WebXMessageBuffer.MESSAGE_HEADER_LENGTH) {
      console.warn('Message does not contain a valid header');
      return null;
    }

    const buffer = new WebXMessageBuffer(data);

    this._handleCriticalMessages(buffer);

    this.handleReceivedBytes(data);

    this._qosHandler.handle(buffer.messageQueueLength);

    const message = await this._serializer.deserializeMessage(buffer);
    if (message != null) {

      // Handle any blocking requests
      if (message.commandId != null && this._instructionResponses.get(message.commandId) != null) {
        const instructionResponse = this._instructionResponses.get(message.commandId);
        this._instructionResponses.delete(message.commandId);
        instructionResponse.resolve(message);

      } else {
        // Send async message
        this.handleMessage(message);
      }
    }
  }

  // eslint-disable-next-line
  handleMessage(message: WebXMessage): void {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line
  handleReceivedBytes(data: ArrayBuffer): void {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line
  handleSentBytes(data: ArrayBuffer): void {
    throw new Error('Method not implemented');
  }

  // eslint-disable-next-line
  handleClose(event: CloseEvent): void {
    // Clear all pending instruction responses
    this._instructionResponses.forEach((response: WebXInstructionResponse<WebXMessage>) => {
      response.reject('Tunnel closed');
    });
    this.onClosed();
  }

  onClosed(): void {
    console.log(`Websocket closed`);
  }

  isConnected(): boolean {
    throw new Error('Method not implemented.');
  }

  setQoSHandler(qosHandler: WebXQoSHandler): void {
    this._qosHandler = qosHandler;
  }

  getQoSHandler(): WebXQoSHandler {
    return this._qosHandler;
  }

  private _handleCriticalMessages(buffer: WebXMessageBuffer): void {
    if (buffer.messageTypeId == WebXMessageType.PING) {
      // Reply immediately with a pong
      this.sendInstruction(new WebXPongInstruction(buffer.timestampMs));

    } else if (buffer.messageTypeId == WebXMessageType.SUBIMAGES || buffer.messageTypeId == WebXMessageType.IMAGE) {
      // Reply immediately with a data ack (if size greater than cutoff)
      if (buffer.bufferLength > WebXTunnel.MIN_BUFFER_LENGTH_FOR_ACK) {
        this.sendInstruction(new WebXDataAckInstruction(buffer.timestampMs, buffer.bufferLength));
      }
    }
  }

}
