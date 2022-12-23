export abstract class WebXStatsHandler {
  abstract handle(stats: { received: number; sent: number }): void;
  abstract destroy(): void;
}
