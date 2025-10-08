/**
 * Represents the properties of a WebX window.
 *
 * These properties define the position, size, and ID of a window in the WebX display.
 */
export class WebXWindowProperties {
  /**
   * The unique identifier of the window.
   */
  public readonly id: number;

  /**
   * The x-coordinate of the window.
   */
  public readonly x: number;

  /**
   * The y-coordinate of the window.
   */
  public readonly y: number;

  /**
   * The width of the window.
   */
  public readonly width: number;

  /**
   * The height of the window.
   */
  public readonly height: number;

  /**
   * Indicates whether the window is shaped (non rectangular).
   */
  public readonly shaped: boolean;

  /**
   * Creates a new instance of WebXWindowProperties.
   *
   * @param properties The properties of the window, including position, size, and ID.
   */
  constructor(properties: { id: number; x: number; y: number; width: number; height: number, shaped: boolean }) {
    this.id = properties.id;
    this.x = properties.x;
    this.y = properties.y;
    this.width = properties.width;
    this.height = properties.height;
    this.shaped = properties.shaped || false;
  }
}
