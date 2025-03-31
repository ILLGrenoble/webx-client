/**
 * Represents a buffer for encoding and decoding WebX messages.
 * 
 * This class provides methods to write and read data in a structured format
 * for communication with the WebX Engine.
 */
export class WebXMessageBuffer {
  /**
   * The length of the message header in bytes.
   */
  public static readonly MESSAGE_HEADER_LENGTH = 48;

  /**
   * The timestamp in milliseconds when the message was created.
   */
  public readonly timestampMs: Uint8Array;

  /**
   * The type ID of the message.
   */
  public readonly messageTypeId: number;

  /**
   * The unique ID of the message.
   */
  public readonly messageId: number;

  /**
   * The total length of the buffer in bytes.
   */
  public readonly bufferLength: number;

  private _readOffset: number = 24;
  private _encoder: TextDecoder = new TextDecoder('utf-8');

  /**
   * Creates a new instance of WebXMessageBuffer.
   * 
   * @param _buffer The buffer to read from.
   */
  constructor(private _buffer: ArrayBuffer) {
    this._readOffset = 24; // Session Id (16) and client index mask (8)
    this.timestampMs = this.getUint8Array(8);
    this.messageTypeId = this.getUint32();
    this.messageId = this.getUint32();
    this.bufferLength = this.getUint32();
    this._readOffset = WebXMessageBuffer.MESSAGE_HEADER_LENGTH;
  }

  /**
   * Reads a 32-bit signed integer from the buffer.
   * 
   * @returns The read value.
   */
  public getInt32(): number {
    const offset = this._getNextReadOffset(4);
    const typedArray = new Int32Array(this._buffer, offset, 1);
    return typedArray[0];
  }

  /**
   * Reads a 32-bit unsigned integer from the buffer.
   * 
   * @returns The read value.
   */
  public getUint32(): number {
    const offset = this._getNextReadOffset(4);
    const typedArray = new Uint32Array(this._buffer, offset, 1);
    return typedArray[0];
  }

  /**
   * Reads a 32-bit floating point number from the buffer.
   * 
   * @returns The read value.
   */
  public getFloat(): number {
    const offset = this._getNextReadOffset(4);
    const typedArray = new Float32Array(this._buffer, offset, 1);
    return typedArray[0];
  }

  /**
   * Reads a Uint8Array from the buffer.
   * 
   * @param length The length of the array to read.
   * @returns The read Uint8Array.
   */
  public getUint8Array(length: number): Uint8Array {
    const typedArray = new Uint8Array(this._buffer, this._readOffset, length);
    this._readOffset += length;
    return typedArray;
  }

  /**
   * Reads a string from the buffer.
   * 
   * @param length The length of the string to read.
   * @returns The read string.
   */
  public getString(length: number): string {
    const array = new Uint8Array(this._buffer, this._readOffset, length);
    this._readOffset += length;
    return this._encoder.decode(array);
  }

  /**
   * Calculates the next read offset, ensuring alignment.
   * 
   * @param sizeOfData The size of the data to read.
   * @returns The next read offset.
   */
  private _getNextReadOffset(sizeOfData: number): number {
    // Ensure alignment
    const padding = this._readOffset % sizeOfData > 0 ? sizeOfData - (this._readOffset % sizeOfData) : 0;
    const position = this._readOffset + padding;

    this._readOffset += sizeOfData + padding;

    return position;
  }
}
