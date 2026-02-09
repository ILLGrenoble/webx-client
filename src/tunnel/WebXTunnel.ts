import {WebXDataAckInstruction, WebXInstruction, WebXInstructionResponse, WebXPongInstruction} from '../instruction';
import {WebXMessage, WebXMessageType} from '../message';
import { WebXBinarySerializer, WebXMessageBuffer } from '../transport';

/**
 * Represents a communication tunnel between the WebX client and the WebX Engine.
 *
 * This class handles sending and receiving data, managing the connection state,
 * and processing responses from the WebX Engine.
 */
export abstract class WebXTunnel {
  private static readonly MIN_BUFFER_LENGTH_FOR_ACK = 32768;

  protected _serializer: WebXBinarySerializer = new WebXBinarySerializer();

  private _instructionResponses: Map<number, WebXInstructionResponse<any>> = new Map<number, WebXInstructionResponse<any>>();

  protected constructor() {
  }

  /**
   * Establishes a connection to the WebX Engine.
   *
   * @param data The data required to establish the connection.
   * @returns A promise that resolves when the connection is successfully established.
   */
  abstract connect(data: any): Promise<Event>;

  /**
   * Closes the connection to the WebX Engine.
   */
  abstract disconnect(): void;

  /**
   * Terminates the Web Worker and clears pending tasks.
   */
  public terminate() {
    this._serializer.terminate();
  }

  /**
   * Sends data to the WebX Engine.
   *
   * @param data The data to send.
   */
  abstract send(data: ArrayBuffer): void;

  /**
   * Checks if the tunnel is currently connected.
   *
   * @returns True if the tunnel is connected, false otherwise.
   */
  abstract isConnected(): boolean;

  /**
   * Sends an instruction to the WebX Engine.
   *
   * @param command The instruction to send.
   */
  sendInstruction(command: WebXInstruction): void {
    // console.log(`Sending command: `, command);
    const message = this._serializer.serializeInstruction(command);
    this.send(message);
  }

  /**
   * Sends a request to the WebX Engine and waits for a response.
   *
   * @param command The request to send.
   * @param timeout The timeout in milliseconds to wait for a response.
   * @returns A promise that resolves with the response from the WebX Engine.
   */
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

  /**
   * Handles incoming messages from the WebX Engine.
   *
   * @param data The received data.
   */
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

    const message = await this._serializer.deserializeMessage(buffer);
    if (message != null) {

      // Handle any blocking requests
      if (message.commandId != null && this._instructionResponses.get(message.commandId) != null) {
        const instructionResponse = this._instructionResponses.get(message.commandId);
        this._instructionResponses.delete(message.commandId);
        instructionResponse.resolve(message);

      } else {
        // Send async message
        await this.handleMessage(message);
      }
    }
  }

  /**
   * Handles a received message from the WebX Engine.
   *
   * @param message The received message.
   */
  async handleMessage(message: WebXMessage): Promise<void> {
    throw new Error('Method not implemented.');
  }

  /**
   * Handles received bytes from the WebX Engine.
   *
   * @param data The received data.
   */
  handleReceivedBytes(data: ArrayBuffer): void {
    throw new Error('Method not implemented.');
  }

  /**
   * Handles sent bytes to the WebX Engine.
   *
   * @param data The sent data.
   */
  handleSentBytes(data: ArrayBuffer): void {
    throw new Error('Method not implemented');
  }

  /**
   * Handles the close event of the connection.
   *
   * @param event The close event.
   */
  handleClose(event: CloseEvent): void {
    // Clear all pending instruction responses
    this._instructionResponses.forEach((response: WebXInstructionResponse<WebXMessage>) => {
      response.reject('Tunnel closed');
    });
    this.onClosed();
  }

  /**
   * Called when the connection is closed.
   */
  onClosed(): void {
    console.log(`Websocket closed`);
  }

  /**
   * Handles critical messages such as PING and data acknowledgments.
   *
   * @param buffer The message buffer.
   */
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
