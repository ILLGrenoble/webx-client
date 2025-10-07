import { WebXInstruction } from '../instruction';
import { WebXMessage } from '../message';
import { WebXTextureFactory } from '../display';
import {WebXInstructionEncoder} from "./WebXInstructionEncoder";
import {WebXMessageDecoder} from "./WebXMessageDecoder";
import {WebXMessageBuffer} from "./WebXMessageBuffer";

/**
 * Serializes and deserializes WebX instructions and messages.
 */
export class WebXBinarySerializer {

  private readonly _instructionEncoder: WebXInstructionEncoder;
  private readonly _messageDecoder: WebXMessageDecoder;

  /**
   * Creates a new instance of WebXBinarySerializer.
   *
   * @param textureFactory The texture factory used for decoding image data.
   */
  constructor(textureFactory: WebXTextureFactory) {
    this._instructionEncoder = new WebXInstructionEncoder();
    this._messageDecoder = new WebXMessageDecoder(textureFactory);
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
   * Deserializes a binary message buffer into a WebXMessage object.
   *
   * @param buffer The binary message buffer to deserialize.
   * @returns A promise that resolves to the deserialized WebXMessage.
   */
  async deserializeMessage(buffer: WebXMessageBuffer): Promise<WebXMessage> {
    try {
      const message = await this._messageDecoder.decode(buffer);
      if (message == null) {
        console.error(`Failed to decode message data`);
      }
      return message;

    } catch (error) {
      console.error(`Caught error decoding message data: ${error.message}`);
    }
  }


}
