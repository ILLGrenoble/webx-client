import { WebXInstruction } from '../instruction';
import { WebXMessage } from '../message';
import { WebXInstructionEncoder, WebXMessageBuffer, WebXMessageDecoder } from '.';
import { WebXTextureFactory } from '../display';

export class WebXBinarySerializer {

  private readonly _instructionEncoder;
  private readonly _messageDecoder;

  constructor(textureFactory: WebXTextureFactory) {
    this._instructionEncoder = new WebXInstructionEncoder();
    this._messageDecoder = new WebXMessageDecoder(textureFactory);
  }

  serializeInstruction(instruction: WebXInstruction): ArrayBuffer {
    // return instruction.toJsonString();
    const encoded = this._instructionEncoder.encode(instruction);
    if (encoded == null) {
      console.warn('Could not serialize instruction: Unknown type');
    }
    return encoded;
  }

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
