import { WebXTunnel } from './WebXTunnel';
import { WebXBinarySerializer } from '../transport';
import * as SocketIOClient from 'socket.io-client'
import Socket = SocketIOClient.Socket;

export class WebXSocketIOTunnel extends WebXTunnel {
  private readonly _url: string;
  private readonly _eventChannel: string;
  private readonly _connectionOptions: any;

  private _socket: Socket;

  constructor(url: string, options: any = {}, eventChannel: string) {
    super();
    this._connectionOptions = options;
    this._url = url;
    this._eventChannel = eventChannel;
    this._serializer = null;
  }

  getSocket(): Socket {
    return this._socket;
  }

  send(data: ArrayBuffer): void {
    this._socket.emit(this._eventChannel, data);
    this.handleSentBytes(data);
  }

  connect(data: any, serializer: WebXBinarySerializer): Promise<Event> {
    const options = {...this._connectionOptions};
    const parameters = new URLSearchParams(data);
    options.query = parameters.toString();

    this._serializer = serializer;
    return new Promise((resolve, reject) => {
      this._socket = io(this._url, options);

      this._socket.on('connect', () => resolve(null));
      this._socket.on('disconnect', this.handleClose.bind(this));
      this._socket.on('connect_error', (event: any) => reject(event));
      this._socket.on(this._eventChannel, (message: any) => this.onMessage(message));
    });
  }

  disconnect(): void {
    if (this._socket) {
      this._socket.disconnect();
      this._socket = null;
    }
  }
}
