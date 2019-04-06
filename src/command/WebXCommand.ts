import { WebXCommandType } from "./WebXCommandType";

export class WebXCommand {

    private static COMMAND_COUNTER = 0;
    private _id: number;

    public get id(): number {
        return this._id;
    }

    constructor(private type: WebXCommandType) {
        this._id = WebXCommand.COMMAND_COUNTER++;
    }

    toJson() {
        return JSON.stringify({
            id: this._id,
            type: this.type
        });
    }
}