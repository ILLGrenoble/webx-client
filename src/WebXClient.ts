import { WebXTunnel } from './tunnel';
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
import {
  WebXDebugImageMessageHandler,
  WebXHandler,
  WebXInstructionHandler,
  WebXMessageHandler,
  WebXStatsHandler
} from './tracer';
import { WebXBinarySerializer } from './transport';

/**
 * The main client class for interacting with the WebX Engine.
 * 
 * This class provides methods to connect to the WebX Engine, manage the display,
 * handle user input (mouse and keyboard), and send/receive instructions and messages.
 */
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

  /**
   * Creates a new instance of the WebXClient.
   * 
   * @param _tunnel The WebXTunnel instance used for communication with the WebX Engine.
   */
  constructor(private _tunnel: WebXTunnel) {
    this._textureFactory = new WebXTextureFactory(this._tunnel);
    this._cursorFactory = new WebXCursorFactory(this._tunnel);
  }

  /**
   * Connects to the WebX Engine and initializes the communication tunnel.
   * 
   * @param onCloseCallback Callback function to execute when the connection is closed.
   * @param data Additional data to send during the connection process.
   */
  async connect(onCloseCallback: () => void, data: any): Promise<void> {
    this._onCloseCallback = onCloseCallback;
    await this._tunnel.connect(data, new WebXBinarySerializer(this._textureFactory));

    this._tunnel.handleMessage = this._handleMessage.bind(this);
    this._tunnel.handleReceivedBytes = this._handleReceivedBytes.bind(this);
    this._tunnel.handleSentBytes = this._handleSentBytes.bind(this);
    this._tunnel.onClosed = this._onTunnelClosed.bind(this);
  }

  /**
   * Disconnects from the WebX Engine and cleans up resources.
   */
  disconnect(): void {
    this._tunnel.disconnect();
  }

  /**
   * Initializes the WebX display and input devices.
   * 
   * @param containerElement The HTML element to render the display.
   * @returns A promise that resolves to the initialized WebXDisplay instance.
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
   * Creates a new WebXDisplay instance.
   * 
   * @param containerElement The HTML element to render the display.
   * @param screenWidth The width of the screen.
   * @param screenHeight The height of the screen.
   * @returns The created WebXDisplay instance.
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
   * Sends a mouse event to the WebX Engine.
   * 
   * @param mouseState The state of the mouse to send in the event.
   */
  public sendMouse(mouseState: WebXMouseState): void {
    this._sendInstruction(new WebXMouseInstruction(mouseState.x, mouseState.y, mouseState.getButtonMask()));
  }

  /**
   * Sends a key event to the WebX Engine.
   * 
   * @param key The key code to send.
   * @param pressed Whether the key is pressed (true) or released (false).
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
   * Registers a new tracer handler.
   * 
   * @param name The unique name of the tracer.
   * @param handler The tracer handler instance.
   */
  registerTracer(name: string, handler: WebXHandler): void {
    this._tracers.set(name, handler);
  }

  createDebugImageMessageHandler(): WebXDebugImageMessageHandler {
    if (this._display) {
      return new WebXDebugImageMessageHandler(this._display);
    }
    console.log('Cannot create DebugImageMessageHandler as display is null');
    return null;
  }

  /**
   * Resets the input devices (mouse and keyboard).
   */
  resetInputs(): void {
    if (this._mouse) {
      this._mouse.reset();
    }

    if (this._keyboard) {
      this._keyboard.reset();
    }
  }

  /**
   * Resizes the WebX display to fit the container.
   */
  resizeDisplay(): void {
    if (this._display) {
      this._display.resize();
    }
  }

  /**
   * Unregisters a tracer handler.
   * 
   * @param name The name of the tracer to unregister.
   */
  unregisterTracer(name: string): void {
    const tracer = this._tracers.get(name);
    if (tracer) {
      // perform cleanup
      tracer.destroy();
      this._tracers.delete(name);
    }
  }

  /**
   * Sets the quality index for the WebX Engine.
   * 
   * @param qualityIndex The quality index to set.
   */
  setQualityIndex(qualityIndex: number): void {
    const qualityInstruction = new WebXQualityInstruction(qualityIndex);
    this._sendInstruction(qualityInstruction);
  }

  /**
   * Retrieves the screen message from the WebX Engine.
   * 
   * This method attempts to get the screen message, retrying up to 3 times
   * if the initial attempts fail.
   * 
   * @returns A promise that resolves to the WebXScreenMessage.
   */
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

        if (retry == 3 || !this._tunnel.isConnected()) {
          throw new Error(`unable to get screen size: ${error.message}`);
        }
      }
    }
  }

  /**
   * Sends an instruction to the WebX Engine.
   * 
   * This method sends the provided instruction to the WebX Engine if the tunnel
   * is connected.
   * 
   * @param command The instruction to send.
   */
  private _sendInstruction(command: WebXInstruction): void {
    if (this._tunnel.isConnected()) {
      this._tunnel.sendInstruction(command);
      this._tracers.forEach((value) => {
        if (value instanceof WebXInstructionHandler) {
          value.handle(command);
        }
      });
    }
  }

  /**
   * Sends a request to the WebX Engine and returns the response.
   * 
   * This method sends the provided request to the WebX Engine and returns a promise
   * that resolves to the response message.
   * 
   * @param command The request to send.
   * @param timeout Optional timeout for the request.
   * @returns A promise that resolves to the WebXMessage.
   */
  private _sendRequest(command: WebXInstruction, timeout?: number): Promise<WebXMessage> {
    if (this._tunnel.isConnected()) {
      return this._tunnel.sendRequest(command, timeout);
    }
  }

  /**
   * Handles incoming messages from the WebX Engine.
   * 
   * This method processes messages received from the WebX Engine and takes
   * appropriate actions based on the message type.
   * 
   * @param message The received message.
   */
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

  /**
   * Handles received bytes from the WebX Engine.
   * 
   * This method processes the received bytes and updates the tracers with the
   * received data.
   * 
   * @param data The received data as an ArrayBuffer.
   */
  private _handleReceivedBytes(data: ArrayBuffer): void {
    this._tracers.forEach((value) => {
      if (value instanceof WebXStatsHandler) {
        value.handle({ received: data.byteLength, sent: 0 });
      }
    });
  }

  /**
   * Handles sent bytes to the WebX Engine.
   * 
   * This method processes the sent bytes and updates the tracers with the
   * sent data.
   * 
   * @param data The sent data as an ArrayBuffer.
   */
  private _handleSentBytes(data: ArrayBuffer): void {
    this._tracers.forEach((value) => {
      if (value instanceof WebXStatsHandler) {
        value.handle({ received: 0, sent: data.byteLength });
      }
    });
  }

  /**
   * Handles the quality of the connection to the WebX Engine.
   * 
   * This method processes the quality data and updates the tracers with the
   * quality information.
   * 
   * @param data The quality data as an ArrayBuffer.
   */
  private _handleQuality(data: ArrayBuffer): void {
    this._tracers.forEach((value) => {
      if (value instanceof WebXStatsHandler) {
        value.handle({ received: 0, sent: data.byteLength });
      }
    });
  }

  /**
   * Handles the tunnel closed event.
   * 
   * This method performs cleanup and executes the onCloseCallback when the
   * tunnel is closed.
   */
  private _onTunnelClosed(): void {
    this._dispose();

    if (this._onCloseCallback) {
      this._onCloseCallback();
    }
  }

  /**
   * Disposes of the WebX client resources.
   * 
   * This method cleans up the display, mouse, and keyboard resources.
   */
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

  /**
   * Adds mouse event listeners to the WebX client.
   * 
   * This method sets up the mouse event listeners for mouse move, mouse out,
   * mouse down, and mouse up events.
   */
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

  /**
   * Adds keyboard event listeners to the WebX client.
   * 
   * This method sets up the keyboard event listeners for key down and key up events.
   */
  private _addKeyboardListeners(): void {
    this._keyboard.onKeyDown = key => {
      this.sendKeyDown(key);
    };

    this._keyboard.onKeyUp = key => {
      this.sendKeyUp(key);
    };
  }
}
