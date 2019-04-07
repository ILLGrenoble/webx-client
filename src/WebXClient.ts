import { WebXTunnel } from "./tunnel";
import { WebXCommand, WebXCommandResponse, WebXCommandType } from "./command";
import { WebXMessageType, WebXMessage, WebXWindowsMessage, WebXConnectionMessage } from "./message";
import { WebXWindowProperties } from "./display";

export class WebXClient {


    constructor(private tunnel: WebXTunnel) {
        tunnel.handleMessage = this.handleMessage.bind(this);
    }

    connect(): Promise<WebXConnectionMessage> {
        return this.tunnel.connect()
            .then(data => {
                // When connect get configuration from server
                return this.sendRequest(new WebXCommand(WebXCommandType.CONNECT)) as Promise<WebXConnectionMessage>;
            });
    }

    sendCommand(command: WebXCommand): void {
        console.log(`Sending command: `, command);
        this.tunnel.sendCommand(command);
    }

    sendRequest(command: WebXCommand): Promise<WebXMessage> {
        console.log(`Sending request: `, command);
        return this.tunnel.sendRequest(command);
    }

    handleMessage(message: WebXMessage) {
        if (message.type === WebXMessageType.WINDOWS) {
            const windows = (message as WebXWindowsMessage).windows;
            this.onWindows(windows);
        }
    }

    onWindows(windows: Array<WebXWindowProperties>):void {
        throw new Error('Method not implemented');
    }


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
    sendKeyEvent(pressed: boolean, key: number): void {
        throw new Error('Method not implemented');
    }



}