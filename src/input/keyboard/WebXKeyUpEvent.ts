import { WebXKeyEvent } from './WebXKeyEvent';

/**
 * Represents a keyup event in the WebX client.
 * 
 * This event is triggered when a key is released.
 */
export class WebXKeyUpEvent extends WebXKeyEvent {

  /**
   * The key code of the released key.
   */
  public readonly keyCode: number;

  /**
   * The key of the released key.
   */
  public readonly key: string;

  /**
   * The location of the released key.
   */
  public readonly location: number;

  /**
   * The key identifier of the released key.
   */
  public readonly keyIdentifier: string;

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
    this.keyCode = keyCode;
    this.key = key;
    this.location = location;
    this.keyIdentifier = keyIdentifier;
    this._keysym = this.keysymFromKeycode(keyCode, location) || this.keysymFromKeyIdentifier(key, location);

    // Keyup is as reliable as it will ever be
    this.reliable = true;

  }
}
