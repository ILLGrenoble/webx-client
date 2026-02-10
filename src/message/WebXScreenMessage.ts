import { WebXMessage } from './WebXMessage';
import { WebXMessageType } from './WebXMessageType';
import {WebXVersion} from "../utils";

/**
 * Represents a message containing screen information.
 *
 * This message is received from the WebX Engine and contains details about
 * the screen size.
 */
export class WebXScreenMessage extends WebXMessage {
  /**
   * The size of the screen.
   */
  public readonly screenSize: { width: number; height: number };


  /**
   * The maximum quality index for the display
   */
  public readonly maxQualityIndex: number;

  /**
   * The version of the WebX Engine.
   */
  public readonly engineVersion: WebXVersion;

  /**
   * Whether the screen can be resized
   */
  public readonly canResizeScreen: boolean;

  /**
   * The name of the current keyboard layout
   */
  public readonly keyboardLayoutName: string;

  /**
   * Constructs a new WebXScreenMessage.
   *
   * @param commandId The ID of the command associated with this message.
   * @param screenSize The size of the screen.
   * @param maxQualityIndex The maximum quality index for the display.
   * @param engineVersion The version of the WebX Engine.
   * @param canResizeScreen Whether the screen can be resized
   * @param keyboardLayoutName The name of the current keyboard layout
   */
  constructor(commandId: number, screenSize: { width: number; height: number }, maxQualityIndex:number, engineVersion: WebXVersion, canResizeScreen: boolean, keyboardLayoutName: string) {
    super(WebXMessageType.SCREEN, commandId);
    this.screenSize = screenSize;
    this.maxQualityIndex = maxQualityIndex;
    this.engineVersion = engineVersion;
    this.canResizeScreen = canResizeScreen;
    this.keyboardLayoutName = keyboardLayoutName;
  }
}
