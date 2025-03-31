import { WebXKeyEvent } from './WebXKeyEvent';

/**
 * Represents a keyup event in the WebX client.
 * 
 * This event is triggered when a key is released.
 */
export class WebXKeyUpEvent extends WebXKeyEvent {

  private readonly _keyCode: number;
  private readonly _key: string;
  private readonly _location: number;
  private readonly _keyIdentifier: string;

  /**
   * Gets the key code associated with this keyup event.
   * 
   * @returns The key code.
   */
  public get keyCode(): number {
    return this._keyCode;
  }

  /**
   * Gets the key associated with this keyup event.
   * 
   * @returns The key.
   */
  public get key(): string {
    return this._key;
  }

  /**
   * Gets the location associated with this keyup event.
   * 
   * @returns The location.
   */
  public get location(): number {
    return this._location;
  }

  /**
   * Gets the key identifier associated with this keyup event.
   * 
   * @returns The key identifier.
   */
  public get keyIdentifier(): string {
    return this._keyIdentifier;
  }

  /**
   * Constructs a new WebXKeyUpEvent.
   * 
   * @param keyCode The key code of the released key.
   * @param keyIdentifier The key identifier of the released key.
   * @param key The key of the released key.
   * @param location The location of the released key.
   */
  constructor(keyCode: number, keyIdentifier: string, key: string, location: number) {
    super();
    this._keyCode = keyCode;
    this._key = key;
    this._location = location;
    this._keyIdentifier = keyIdentifier;
    this._keysym = this.keysymFromKeycode(keyCode, location) || this.keysymFromKeyIdentifier(key, location);

    // Keyup is as reliable as it will ever be
    this.reliable = true;

  }
}
