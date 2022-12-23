export class WebXWindowProperties {
  public id: number;
  public x: number;
  public y: number;
  public width: number = 1;
  public height: number = 1;

  constructor(configuration: { id: number; x: number; y: number; width: number; height: number }) {
    const { id, x, y, width, height } = configuration;
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}
