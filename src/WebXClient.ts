import { WebXQoSHandler, WebXTunnel } from './tunnel';
import {
  WebXInstruction,
  WebXScreenInstruction,
  WebXKeyboardInstruction,
  WebXMouseInstruction,
  WebXWindowsInstruction,
  WebXQualityInstruction
} from './instruction';
import {
  WebXMessageType,
  WebXMessage,
  WebXWindowsMessage,
  WebXImageMessage,
  WebXSubImagesMessage,
  WebXMouseMessage,
  WebXScreenMessage
} from './message';
import { WebXDisplay, WebXCursorFactory, WebXTextureFactory } from './display';
import { WebXKeyboard, WebXMouse, WebXMouseState } from './input';
import { WebXHandler, WebXInstructionHandler, WebXMessageHandler, WebXStatsHandler } from './tracer';
import { WebXBinarySerializer } from './transport';

export class WebXClient {

  private readonly _textureFactory: WebXTextureFactory;
  private readonly _cursorFactory: WebXCursorFactory;

  private _tracers: Map<string, WebXHandler> = new Map();
  private _onCloseCallback: () => void;

  private _display: WebXDisplay;
  private _mouse: WebXMouse;
  private _keyboard: WebXKeyboard;

  get tunnel(): WebXTunnel {
    return this._tunnel;
  }

  get tracers(): Map<string, WebXHandler> {
    return this._tracers;
  }

  get display(): WebXDisplay {
    return this._display;
  }

  get mouse(): WebXMouse {
    return this._mouse;
  }

  get keyboard(): WebXKeyboard {
    return this._keyboard;
  }

  constructor(private _tunnel: WebXTunnel) {
    this._textureFactory = new WebXTextureFactory(this._tunnel);
    this._cursorFactory = new WebXCursorFactory(this._tunnel);
  }

  async connect(onCloseCallback: () => void, data: any): Promise<void> {
    this._onCloseCallback = onCloseCallback;
    await this._tunnel.connect(data, new WebXBinarySerializer(this._textureFactory));

    this._tunnel.handleMessage = this._handleMessage.bind(this);
    this._tunnel.handleReceivedBytes = this._handleReceivedBytes.bind(this);
    this._tunnel.handleSentBytes = this._handleSentBytes.bind(this);
    this._tunnel.onClosed = this._onTunnelClosed.bind(this);
  }

  disconnect(): void {
    this._tunnel.disconnect();
  }

  /**
   *
   * @param containerElement The main container
   * @param screenWidth  the screen width
   * @param screenHeight the screen height
   */
  async initialise(containerElement: HTMLElement): Promise<WebXDisplay> {
    // Request 1. : Get screen size
    try {
      const screenMessage = await this._getScreenMessage();
      const { width, height } = screenMessage.screenSize;

      // Initialise the display
      this._display = this.createDisplay(containerElement, width, height);

      // Request 2. : Get visible windows
      // Sec request for visible windows
      const windowsMessage = await this._sendRequest(new WebXWindowsInstruction()) as WebXWindowsMessage;

      // Requests 3. - N : Initialise all windows and wait for them to be visible (requests for window images)
      await this._display.updateWindows(windowsMessage.windows);
      this._display.showScreen();

      // Create mouse and add listeners
      this._mouse = this.createMouse(containerElement);
      this._addMouseListeners();

      // Create keyboard and add listeners
      this._keyboard = this.createKeyboard(document.body);
      this._addKeyboardListeners();

      return this._display;

    } catch (error) {
      this._dispose();

      throw new Error(`Failed to initialise display: ${error.message}`);
    }
  }

  /**
   *
   * @param containerElement The main container
   * @param screenWidth  the screen width
   * @param screenHeight the screen height
   */
  createDisplay(containerElement: HTMLElement, screenWidth: number, screenHeight: number): WebXDisplay {
    return new WebXDisplay(containerElement, screenWidth, screenHeight, this._textureFactory, this._cursorFactory);
  }

  /**
   * Create a new mouse and bind it to an element
   * @param element the element to attach the mouse to
   */
  createMouse(element: HTMLElement): WebXMouse {
    return new WebXMouse(element);
  }

  /**
   * Create a new keyboard and bind it to an element
   * @param element the element to attach the keyboard to
   */
  createKeyboard(element: HTMLElement): WebXKeyboard {
    return new WebXKeyboard(element);
  }


  /**
   * Sends a mouse event having the properties provided by the given mouse state
   * @param mouseState the state of the mouse to send in the mouse event
   */
  public sendMouse(mouseState: WebXMouseState): void {
    this._sendInstruction(new WebXMouseInstruction(mouseState.x, mouseState.y, mouseState.getButtonMask()));
  }

  /**
   * Sends a key event
   * @param pressed {Boolean} Whether the key is pressed (true) or released (false)
   * @param key {number} the key to send
   */
  public sendKeyEvent(key: number, pressed: boolean): void {
    this._sendInstruction(new WebXKeyboardInstruction(key, pressed));
  }

  /**
   * Sends a key down event
   * @param key {number} the key to send
   */
  public sendKeyDown(key: number): void {
    this.sendKeyEvent(key, true);
  }

  /**
   * Sends a key up event
   * @param key {number} the key to send
   */
  public sendKeyUp(key: number): void {
    this.sendKeyEvent(key, false);
  }

  /**
   * Register a new tracer handler
   * @param name the name of the tracer (must be unique)
   * @param handler the tracer handler
   */
  registerTracer(name: string, handler: WebXHandler): void {
    this._tracers.set(name, handler);
  }

  resetInputs(): void {
    if (this._mouse) {
      this._mouse.reset();
    }

    if (this._keyboard) {
      this._keyboard.reset();
    }
  }

  resizeDisplay(): void {
    if (this._display) {
      this._display.resize();
    }
  }

  /**
   * Unregister a tracer
   * @param name the name of the tracer
   */
  unregisterTracer(name: string): void {
    const tracer = this._tracers.get(name);
    if (tracer) {
      // perform cleanup
      tracer.destroy();
      this._tracers.delete(name);
    }
  }

  setQualityIndex(qualityIndex: number): void {
    const qualityInstruction = new WebXQualityInstruction(qualityIndex);
    this._sendInstruction(qualityInstruction);
    this._tunnel.getQoSHandler().setQuality(qualityIndex);
  }

  setQoSHandler(qosHandler: WebXQoSHandler): void {
    this._tunnel.setQoSHandler(qosHandler);
  }

  getQoSHandler(): WebXQoSHandler {
    return this._tunnel.getQoSHandler();
  }

  private async _getScreenMessage(): Promise<WebXScreenMessage> {
    // Perform retries on the first instruction (client can sometimes be activated before the server connection$
    // has been fully made (difficult to judge when the webx-engine subscribes to the webx-relay instruction publisher
    let retry = 0;
    while (retry < 3) {
      try {
        return await this._sendRequest(new WebXScreenInstruction(), 5000) as WebXScreenMessage;

      } catch (error) {
        retry++;
        console.log(`Failed to initialise screen size at attempt ${retry}/3...`)

        if (retry == 3) {
          throw new Error(`unable to get screen size: ${error.message}`);
        }
      }
    }
  }

  private _sendInstruction(command: WebXInstruction): void {
    this._tunnel.sendInstruction(command);
    this._tracers.forEach((value) => {
      if (value instanceof WebXInstructionHandler) {
        value.handle(command);
      }
    });
  }

  private _sendRequest(command: WebXInstruction, timeout?: number): Promise<WebXMessage> {
    return this._tunnel.sendRequest(command, timeout);
  }

  private _handleMessage(message: WebXMessage): void {
    if (!this._display) {
      return;
    }

    if (message.type === WebXMessageType.WINDOWS) {
      const windows = (message as WebXWindowsMessage).windows;
      this._display.updateWindows(windows);

    } else if (message.type === WebXMessageType.IMAGE) {
      const imageMessage = message as WebXImageMessage;
      // console.log(`Updating image ${windowId} [${texture.image.width}, ${texture.image.height}]\n`);
      this._display.updateImage(imageMessage.windowId, imageMessage.depth, imageMessage.colorMap, imageMessage.alphaMap);

    } else if (message.type === WebXMessageType.SUBIMAGES) {
      const subImagesMessage = message as WebXSubImagesMessage;
      // console.log(`Updating sub images ${windowId}\n`);
      this._display.updateSubImages(subImagesMessage.windowId, subImagesMessage.subImages);

    } else if (message.type === WebXMessageType.MOUSE) {
      const mouseMessage = message as WebXMouseMessage;
      this._display.updateMouse(mouseMessage.x, mouseMessage.y, mouseMessage.cursorId);
    }

    this._tracers.forEach((value) => {
      if (value instanceof WebXMessageHandler) {
        value.handle(message);
      }
    });
  }

  private _handleReceivedBytes(data: ArrayBuffer): void {
    this._tracers.forEach((value) => {
      if (value instanceof WebXStatsHandler) {
        value.handle({ received: data.byteLength, sent: 0 });
      }
    });
  }

  private _handleSentBytes(data: ArrayBuffer): void {
    this._tracers.forEach((value) => {
      if (value instanceof WebXStatsHandler) {
        value.handle({ received: 0, sent: data.byteLength });
      }
    });
  }

  private _handleQuality(data: ArrayBuffer): void {
    this._tracers.forEach((value) => {
      if (value instanceof WebXStatsHandler) {
        value.handle({ received: 0, sent: data.byteLength });
      }
    });
  }

  private _onTunnelClosed(): void {
    this._dispose();

    if (this._onCloseCallback) {
      this._onCloseCallback();
    }
  }

  private _dispose(): void {
    if (this._display) {
      this._display.dispose();
    }
    if (this._mouse) {
      this._mouse.dispose();
    }
    if (this._keyboard) {
      this._keyboard.dispose();
    }
  }

  private _addMouseListeners(): void {
    this._mouse.onMouseMove = this._mouse.onMouseOut = (mouseState: WebXMouseState) => {
      const scale = this._display.scale;
      mouseState.x = mouseState.x / scale;
      mouseState.y = mouseState.y / scale;
      this.sendMouse(mouseState);
      this._display.updateMousePosition(mouseState.x, mouseState.y);
    };

    this._mouse.onMouseDown = this._mouse.onMouseUp = (mouseState: WebXMouseState) => {
      this.sendMouse(mouseState);
    };
  }

  private _addKeyboardListeners(): void {
    this._keyboard.onKeyDown = key => {
      this.sendKeyDown(key);
    };

    this._keyboard.onKeyUp = key => {
      this.sendKeyUp(key);
    };
  }
}
