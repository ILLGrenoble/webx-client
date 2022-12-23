import { WebXKeyEvent } from './WebXKeyEvent';

export class WebXKeyUpEvent extends WebXKeyEvent {

  private readonly _keyCode: number;
  private readonly _key: string;
  private readonly _location: number;
  private readonly _keyIdentifier: string;

  public get keyCode(): number {
    return this._keyCode;
  }

  public get key(): string {
    return this._key;
  }

  public get location(): number {
    return this._location;
  }

  public get keyIdentifier(): string {
    return this._keyIdentifier;
  }

  constructor(key: string, location: number) {
    super();
    this._key = key;
    this._location = location;
    this._keysym = this.keysymFromKeyIdentifier(key, location);

    // Keyup is as reliable as it will ever be
    this.reliable = true;

  }
}
