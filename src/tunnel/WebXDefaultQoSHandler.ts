import { WebXQoSHandler } from './WebXQoSHandler';
import { WebXTunnel } from './WebXTunnel';
import { WebXQualityInstruction } from '../instruction';

export class WebXDefaultQoSHandler extends WebXQoSHandler {
  private _active = true;
  private _currentQueueLength = 0;
  private _waiting = false;
  private _currentQuality = 10;

  constructor(private _tunnel: WebXTunnel) {
    super();
  }

  handle(messageQueueLength: number): void {
    if (this._active && !this._waiting) {
      if (messageQueueLength > this._currentQueueLength) {
        this._decreaseQuality();
        this._currentQueueLength = messageQueueLength;

      } else if (messageQueueLength == 0) {
        this._increaseQuality();
        this._currentQueueLength = messageQueueLength;
      }

      this._waiting = true;
      setTimeout(() => this._waiting = false, 500);
    }
  }

  setActive(isActive: boolean): void {
    this._active = isActive;
  }

  getQuality(): number {
    return this._currentQuality;
  }

  setQuality(quality: number): void {
    this._currentQuality = quality;
    this.dispatchEvent(new CustomEvent('quality', { detail: {quality: quality}}));
  }

  private _decreaseQuality() {
    if (this._currentQuality > 1) {
      this.setQuality(this._currentQuality - 1);
      const qualityInstruction = new WebXQualityInstruction(this._currentQuality);
      this._tunnel.sendInstruction(qualityInstruction);
      // console.log(`setting quality to ${this._currentQuality}`);
    }
  }

  private _increaseQuality() {
    if (this._currentQuality < 10) {
      this.setQuality(this._currentQuality + 1);
      const qualityInstruction = new WebXQualityInstruction(this._currentQuality);
      this._tunnel.sendInstruction(qualityInstruction);
      // console.log(`setting quality to ${this._currentQuality}`);
    }
  }

}
