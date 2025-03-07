import { WebXInstruction } from '../instruction';

export class WebXInstructionBuffer {

  private readonly _buffer: ArrayBuffer;
  private _offset;

  constructor(instruction: WebXInstruction, length: number) {
    // 16 for sessionID place holder (set by the relay), 4 for the clientId (set by the relay) and 8 for the instruction type and id, 4 padding
    // Maintain 8 bit alignment to ensure long values can be written without additional padding
    const headerSize = 32;
    this._buffer = new ArrayBuffer(length + headerSize);

    this._offset = 20;

    // add the header
    if (instruction.synchronous) {
      this.putUInt32(0x80000000 | instruction.type);
    } else {
      this.putUInt32(instruction.type);
    }
    this.putUInt32(instruction.id);

    // Padding to make up 32 bytes (maintaining 8 bit alignment)
    this.putUInt32(0);
  }

  private _getNextOffset(sizeOfData: number): number {
    // Ensure alignment
    const padding = this._offset % sizeOfData > 0 ? sizeOfData - (this._offset % sizeOfData) : 0;
    const position = this._offset + padding;

    this._offset += sizeOfData + padding;

    return position;
  }

  /**
   * Write a signed 32 bit integer to the buffer
   */
  public putInt32(value: number): WebXInstructionBuffer {
    const offset = this._getNextOffset(4);
    const typedArray = new Int32Array(this._buffer, offset, 1);
    typedArray[0] = value;
    return this;
  }

  /**
   * Write an unsigned 8 bit integer to the buffer
   * @param value the value to write
   */
  public putUInt8(value: number): WebXInstructionBuffer {
    const offset = this._getNextOffset(1);
    const typedArray = new Uint8Array(this._buffer, offset, 1);
    typedArray[0] = value;
    return this;
  }

  /**
   * Write an unsigned 32 bit integer to the buffer
   * @param value the value to write
   */
  putUInt32(value: number): WebXInstructionBuffer {
    const offset = this._getNextOffset(4);
    const typedArray = new Uint32Array(this._buffer, offset, 1);
    typedArray[0] = value;
    return this;
  }

  putUInt8Array(array: Uint8Array, length: number): WebXInstructionBuffer {
    const offset = this._getNextOffset(8);
    const typedArray = new Uint8Array(this._buffer, offset, length);
    typedArray.set(array);
    return this;
  }

  /**
   * Write a string to the buffer
   * @param value the value to write
   */
  public putString(value: string): WebXInstructionBuffer {
    for (let i = 0; i < value.length; i++) {
      this.putUInt8(value.charCodeAt(i));
    }
    return this;
  }

  /**
   * Write a boolean to the buffer
   * @param value the value to write
   */
  public putBoolean(value: boolean): WebXInstructionBuffer {
    this.putUInt32(value === true ? 0xff : 0x00);
    return this;
  }

  /**
   * Get the array buffer
   */
  public buffer(): ArrayBuffer {
    return this._buffer;
  }

}
