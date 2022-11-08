import { WebXInstruction, WebXInstructionResponse } from '../instruction';
import { WebXMessage } from '../message';
import { WebXBinarySerializer, WebXMessageBuffer } from '../transport';
import { WebXQoSHandler } from './WebXQoSHandler';
import { WebXDefaultQoSHandler } from './WebXDefaultQoSHandler';

export abstract class WebXTunnel {
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
    this.handleReceivedBytes(data);

    if (data.byteLength === 0) {
      console.warn('Got a zero length message');
      return null;
    } else if (data.byteLength < 32) {
      console.warn('Message does not contain a valid header');
      return null;
    }

    const buffer = new WebXMessageBuffer(data);
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

  handleMessage(message: WebXMessage): void {
    throw new Error('Method not implemented.');
  }

  handleReceivedBytes(data: ArrayBuffer): void {
    throw new Error('Method not implemented.');
  }

  handleSentBytes(data: ArrayBuffer): void {
    throw new Error('Method not implemented');
  }

  handleClose(event: CloseEvent): void {
    // Clear all pending instruction responses
    this._instructionResponses.forEach((response: WebXInstructionResponse<WebXMessage>, id: number) => {
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

}
