export abstract class WebXQoSHandler extends EventTarget {
  abstract handle(messageQueueLength: number): void;
  abstract setActive(isActive: boolean): void;
  abstract getQuality(): number;
  abstract setQuality(quality: number): void;
}
