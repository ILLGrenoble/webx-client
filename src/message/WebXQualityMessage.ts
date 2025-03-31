import { WebXMessage } from './WebXMessage';
import { WebXMessageType } from './WebXMessageType';

/**
 * Represents a message containing quality-related information.
 * 
 * This message is received from the WebX Engine and contains details about
 * the quality settings.
 */
export class WebXQualityMessage extends WebXMessage {
  /**
   * The quality index.
   */
  public readonly index: number;

  /**
   * The frames per second (FPS) for image rendering.
   */
  public readonly imageFPS: number;

  /**
   * The quality level for RGB data.
   */
  public readonly rgbQuality: number;

  /**
   * The quality level for alpha data.
   */
  public readonly alphaQuality: number;

  /**
   * The maximum bandwidth in Mbps for window image updates.
   */
  public readonly maxMbps: number;

  /**
   * Constructs a new WebXQualityMessage.
   * 
   * @param index The quality index.
   * @param imageFPS The frames per second for image rendering.
   * @param rgbQuality The quality level for RGB data.
   * @param alphaQuality The quality level for alpha data.
   * @param maxMbps The maximum bandwidth in Mbps.
   */
  constructor(index: number, imageFPS: number, rgbQuality: number, alphaQuality: number, maxMbps: number) {
    super(WebXMessageType.QUALITY);
    this.index = index;
    this.imageFPS = imageFPS;
    this.rgbQuality = rgbQuality;
    this.alphaQuality = alphaQuality;
    this.maxMbps = maxMbps;
  }
}
