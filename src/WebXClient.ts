import { WebXTunnel } from './tunnel';
import { WebXInstruction, WebXInstructionType, WebXScreenInstruction } from './instruction';
import { WebXMessageType, WebXMessage, WebXWindowsMessage, WebXImageMessage, WebXSubImagesMessage } from './message';
import { WebXWindowProperties, WebXSubImage } from './display';
import { WebXTextureFactory } from './display/WebXTextureFactory';
import { Texture } from 'three';
import { WebXScreenMessage } from './message/WebXScreenMessage';
import { WebXMouseCursorMessage } from './message/WebXMouseCursorMessage';

export class WebXClient {
  constructor(private _tunnel: WebXTunnel) {
    this._tunnel.handleMessage = this.handleMessage.bind(this);
    WebXTextureFactory.initInstance(this._tunnel);
  }

  connect(): Promise<WebXScreenMessage> {
    return this._tunnel.connect().then(data => {
      // When connect get configuration from server
      return this.sendRequest(new WebXScreenInstruction()) as Promise<WebXScreenMessage>;
    });
  }

  sendInstruction(command: WebXInstruction): void {
    this._tunnel.sendInstruction(command);
  }

  sendRequest(command: WebXInstruction): Promise<WebXMessage> {
    return this._tunnel.sendRequest(command);
  }

  handleMessage(message: WebXMessage) {
    if (message.type === WebXMessageType.WINDOWS) {
      const windows = (message as WebXWindowsMessage).windows;
      this.onWindows(windows);

    } else if (message.type === WebXMessageType.IMAGE) {
      const imageMessage = message as WebXImageMessage;
      this.onImage(imageMessage.windowId, imageMessage.depth, imageMessage.texture);

    } else if (message.type === WebXMessageType.SUBIMAGES) {
      const subImagesMessage = message as WebXSubImagesMessage;
      this.onSubImages(subImagesMessage.windowId, subImagesMessage.subImages);
      
    } else if (message.type === WebXMessageType.MOUSE_CURSOR) {
      const mouseCursorMessage = message as WebXMouseCursorMessage;
      this.onMouseCursor(mouseCursorMessage.x, mouseCursorMessage.y, mouseCursorMessage.texture);
    }
  }
  onMouseCursor(x: number, y: number, image: any) {}

  onWindows(windows: Array<WebXWindowProperties>): void {}

  onImage(windowId: number, depth: number, texture: Texture): void {}

  onSubImages(windowId: number, subImages: WebXSubImage[]): void {}

  /**
   * Sends a mouse event having the properties provided by the given mouse state
   * @param mouseState the state of the mouse to send in the mouse event
   */
  sendMouseState(mouseState: any): void {
    throw new Error('Method not implemented');
  }

  /**
   * Sends a key event
   * @param pressed {Boolean} Whether the key is pressed (true) or released (false)
   * @param key {number} the key to send
   */
  sendKeyEvent(key: number, pressed: boolean): void {
    throw new Error('Method not implemented');
  }
}
