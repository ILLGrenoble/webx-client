export class WebXMessageBuffer {

  public static readonly MESSAGE_HEADER_LENGTH = 48;

  private readonly _timestampMs: Uint8Array;
  private readonly _messageTypeId: number;
  private readonly _messageId: number;
  private readonly _bufferLength: number;

  private _readOffset: number = 24;

  private _encoder: TextDecoder = new TextDecoder('utf-8');

  get timestampMs(): Uint8Array {
    return this._timestampMs;
  }

  public get messageTypeId(): number {
    return this._messageTypeId;
  }

  public get messageId(): number {
    return this._messageId;
  }

  public get bufferLength(): number {
    return this._bufferLength;
  }

  constructor(private _buffer: ArrayBuffer) {
    this._readOffset = 24; // Session Id (16) and client index mask (8)
    this._timestampMs = this.getUint8Array(8);
    this._messageTypeId = this.getUint32();
    this._messageId = this.getUint32();
    this._bufferLength = this.getUint32();
    this._readOffset = WebXMessageBuffer.MESSAGE_HEADER_LENGTH;
  }

  public getInt32(): number {
    const offset = this._getNextReadOffset(4);

    const typedArray = new Int32Array(this._buffer, offset, 1);

    return typedArray[0];
  }

  public getUint32(): number {
    const offset = this._getNextReadOffset(4);

    const typedArray = new Uint32Array(this._buffer, offset, 1);

    return typedArray[0];
  }

  public getUint8Array(length: number): Uint8Array {
    const typedArray = new Uint8Array(this._buffer, this._readOffset, length);
    this._readOffset += length;

    return typedArray;
  }

  public getString(length: number): string {
    const array = new Uint8Array(this._buffer, this._readOffset, length);
    this._readOffset += length;
    return this._encoder.decode(array);
  }

  private _getNextReadOffset(sizeOfData: number): number {
    // Ensure alignment
    const padding = this._readOffset % sizeOfData > 0 ? sizeOfData - (this._readOffset % sizeOfData) : 0;
    const position = this._readOffset + padding;

    this._readOffset += sizeOfData + padding;

    return position;
  }

}
