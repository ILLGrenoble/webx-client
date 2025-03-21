import { WebXTunnel } from './WebXTunnel';
import { WebXBinarySerializer } from '../transport';

export class WebXWebSocketTunnel extends WebXTunnel {
  private readonly _url: string;
  private _socket: WebSocket;
  private _connectionOptions: any;
  private _socketOpen = false;

  constructor(url: string, options: any = {}) {
    super();
    this._connectionOptions = options;
    this._url = url;
  }

  getSocket(): WebSocket {
    return this._socket;
  }

  send(data: ArrayBuffer): void {
    if (this._socket != null) {
      this._socket.send(data);
      this.handleSentBytes(data);
    }
  }

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

  disconnect(): void {
    if (this._socket) {
      this._socketOpen = false;
      this._socket.close()
      this._socket = null;
    }
  }

  isConnected(): boolean {
    return this._socketOpen;
  }


}
