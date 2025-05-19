import { WebXTunnel } from './WebXTunnel';
import { WebXBinarySerializer } from '../transport';

/**
 * Represents a WebSocket-based implementation of the WebX communication tunnel.
 *
 * This class manages the WebSocket connection to the WebX Engine, handles
 * sending and receiving data, and processes events related to the connection.
 */
export class WebXWebSocketTunnel extends WebXTunnel {
  private readonly _url: string;
  private _socket: WebSocket;
  private _connectionOptions: any;
  private _socketOpen = false;

  constructor(url: string, options: any = {}) {
    super();
    this._connectionOptions = options;

    // Ensure that the URL is a valid WebSocket URL for older browsers
    if (url.substring(0, 3) !== "ws:" && url.substring(0, 4) !== "wss:") {
      const location = window.location;
      const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
      const hostname = location.hostname;
      const port = location.port ? `:${location.port}` : '';

      if (url.substring(0, 1) === "/")
        url = `${protocol}//${hostname}${port}${url}`;

      else {
        url = `${protocol}//${hostname}${port}/${url}`;
      }
    }

    this._url = url;
  }

  getSocket(): WebSocket {
    return this._socket;
  }

  /**
   * Sends data to the WebX Engine over the WebSocket connection.
   *
   * @param data The data to send.
   */
  send(data: ArrayBuffer): void {
    if (this._socket != null) {
      this._socket.send(data);
      this.handleSentBytes(data);
    }
  }

  /**
   * Establishes a WebSocket connection to the WebX Engine.
   *
   * @param data The connection options.
   * @param serializer The serializer to use for encoding/decoding messages.
   * @returns A promise that resolves when the connection is successfully established.
   */
  connect(data: any, serializer: WebXBinarySerializer): Promise<Event> {
    const options = {...this._connectionOptions, ...data};
    const parameters = new URLSearchParams(options);
    const url = `${this._url}?${parameters}`;

    this._serializer = serializer;
    return new Promise((resolve, reject) => {
      this._socket = new WebSocket(url);
      this._socket.binaryType = 'arraybuffer';
      this._socket.onopen = () => {
        this._socketOpen = true;
        resolve(null);
      };
      this._socket.onerror = (event: Event) => reject(event);
      this._socket.onclose = this.handleClose.bind(this);
      this._socket.onmessage = (aMessage: any) => this.onMessage(aMessage.data);
    });
  }

  /**
   * Closes the WebSocket connection to the WebX Engine.
   */
  disconnect(): void {
    if (this._socket) {
      this._socketOpen = false;
      this._socket.close()
      this._socket = null;
    }
  }

  /**
   * Checks if the WebSocket connection is currently open.
   *
   * @returns True if the WebSocket is open, false otherwise.
   */
  isConnected(): boolean {
    return this._socketOpen;
  }
}
