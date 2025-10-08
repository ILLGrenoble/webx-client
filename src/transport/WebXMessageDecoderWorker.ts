import {WebXMessageDecoder} from "./WebXMessageDecoder";
import {WebXMessageBuffer} from "./WebXMessageBuffer";
import {getMessageTransfers} from "./WebXMessageFunc";

const messageDecoder = new WebXMessageDecoder();

/**
 * The entry point for the web worker. Receives messages with data for color, alpha and stencil data and calls the blending
 * function.
 */
self.onmessage = async (e) => {
  const { id, buffer } = e.data;

  try {
    const messageBuffer = new WebXMessageBuffer(buffer);

    // console.log(`Decoding message of type ${messageBuffer.messageTypeId}`);
    const message = await messageDecoder.decode(messageBuffer);
    if (message == null) {
      console.error(`Failed to decode message data`);
    }

    const transfers = getMessageTransfers(message);

    // @ts-ignore
    self.postMessage({ id, message }, transfers);

  } catch (error) {
    self.postMessage({ id, error: `Caught error decoding message data: ${error.message}` });
  }

};

