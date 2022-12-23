import { WebXKeyEvent } from './WebXKeyEvent';

/**
 * Information related to the pressing of a key, which MUST be
 * associated with a printable character. The presence or absence of any
 * information within this object is browser-dependent.
 */
export class WebXKeyPressEvent extends WebXKeyEvent {
  private _key: string;
  private readonly _location: number;

  get key(): string {
    return this._key;
  }

  get location(): number {
    return this._location;
  }

  constructor(key: string, location: number) {
    super();
    this._key = key;
    this._location = location;
    this._keysym = this.keysymFromKeyIdentifier(key, location);

    this.reliable = true;
  }
}
