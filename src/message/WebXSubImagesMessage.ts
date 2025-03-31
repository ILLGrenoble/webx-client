import { WebXMessage } from './WebXMessage';
import { WebXMessageType } from './WebXMessageType';
import { WebXSubImage } from '../display';

/**
 * Represents a message containing sub-image data for a window.
 * 
 * This message is received from the WebX Engine and contains a list of
 * sub-images that should be updated.
 */
export class WebXSubImagesMessage extends WebXMessage {
  /**
   * The ID of the window associated with these sub-images.
   */
  public readonly windowId: number;

  /**
   * The list of sub-images.
   */
  public readonly subImages: Array<WebXSubImage>;

  /**
   * The size of the message in bytes.
   */
  public readonly size: number;

  /**
   * Constructs a new WebXSubImagesMessage.
   * 
   * @param windowId The ID of the window.
   * @param subImages The list of sub-images.
   * @param commandId The ID of the command associated with this message.
   * @param size The size of the message in bytes.
   */
  constructor(windowId: number, subImages: Array<WebXSubImage>, commandId: number, size: number) {
    super(WebXMessageType.SUBIMAGES, commandId);
    this.windowId = windowId;
    this.subImages = subImages;
    this.size = size;
  }
}
