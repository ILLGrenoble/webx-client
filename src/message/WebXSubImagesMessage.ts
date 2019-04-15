import { WebXMessage } from "./WebXMessage";
import { WebXMessageType } from "./WebXMessageType";
import { WebXSubImage } from "../display";

export class WebXSubImagesMessage extends WebXMessage {
    
    public get windowId(): number {
        return this._windowId;
    }

    public get subImages(): WebXSubImage[] {
        return this._subImages;
    }

    constructor(private _windowId: number, private _subImages: WebXSubImage[], commandId?: number) {
        super(WebXMessageType.SUBIMAGES, commandId);
    }
}