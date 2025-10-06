import * as THREE from 'three';
import { Texture, LinearFilter } from 'three';
import { WebXCursorFactory } from './WebXCursorFactory';

/**
 * Represents the cursor in the WebX display.
 *
 * This class manages the cursor's position, appearance, and updates based on
 * the cursor ID and coordinates provided by the WebX Engine.
 */
export class WebXCursor {
  private _cursorId: number;
  private _texture: THREE.Texture;

  private readonly _canvas: HTMLCanvasElement;
  private readonly _context: CanvasRenderingContext2D;
  private _needsUpdate = true;

  private _x: number = -1;
  private _y: number = -1;
  private _xHot: number = 0;
  private _yHot: number = 0;
  private _width: number = 1;
  private _height: number = 1;

  /**
   * Gets the HTML Canvas containing the the cursor image.
   *
   * @returns The cursor canvas.
   */
  get canvas(): HTMLCanvasElement {
    return this._canvas;
  }

  /**
   * Gets the cursor ID.
   *
   * @returns The cursor ID.
   */
  public get cursorId(): number {
    return this._cursorId;
  }

  /**
   * Sets the x-coordinate of the cursor.
   *
   * @param value The x-coordinate.
   */
  public set x(value: number) {
    this._x = value;
    this._updatePosition();
  }

  /**
   * Sets the y-coordinate of the cursor.
   *
   * @param value The y-coordinate.
   */
  public set y(value: number) {
    this._y = value;
    this._updatePosition();
  }

  /**
   * Creates a new instance of WebXCursor.
   *
   * @param _cursorFactory The factory used to create cursor textures.
   */
  constructor(private _cursorFactory: WebXCursorFactory) {
    this._canvas = document.createElement('canvas');
    this._canvas.id = 'webx-cursor';
    this._canvas.style.position = 'absolute';
    this._canvas.style.pointerEvents = 'none';
    this._context = this._canvas.getContext('2d');

    this.setPosition(-1, -1);
    this.setCursorId(0);
  }

  /**
   * Sets the position of the cursor.
   *
   * @param x The x-coordinate of the cursor.
   * @param y The y-coordinate of the cursor.
   */
  public setPosition(x: number, y: number): void {
    this._x = x;
    this._y = y;

    this._updatePosition();
  }

  /**
   * Updates the cursor's position and appearance based on the given cursor ID and coordinates.
   *
   * @param cursorId The ID of the cursor to display.
   */
  public setCursorId(cursorId: number): void {
    if (this._cursorId === cursorId) {
      return;
    }

    this._cursorId = cursorId;
    this._cursorFactory.getCursor(cursorId).then(cursorData => {
      const cursor = cursorData.cursor;

      if (this._x < 0 || this._y < 0) {
        this.setPosition(cursorData.x, cursorData.y);
      }

      this._updateCursor(cursor.xHot, cursor.yHot, cursor.cursorId, cursor.texture);
    });
  }

  /**
   * Disposes the texture
   */
  public dispose(): void {
    if (this._texture) {
      this._texture.dispose();
    }
  }

  /**
   * Updates the mouse cursor, appearance, and texture.
   *
   * @param xHot The x-coordinate of the cursor's hotspot.
   * @param yHot The y-coordinate of the cursor's hotspot.
   * @param cursorId The ID of the cursor to display.
   * @param texture The texture of the cursor.
   */
  private _updateCursor(xHot: number, yHot: number, cursorId: number, texture: Texture): void {
    this._xHot = xHot;
    this._yHot = yHot;
    this._cursorId = cursorId;

    if (texture != null && texture.image != null) {
      this._width = texture.image.width;
      this._height = texture.image.height;
      // console.log(`WebXCursor ${cursorId}: ${xHot}, ${yHot}, ${this._width}, ${this._height}`);

      this._canvas.style.width = `${this._width}px`;
      this._canvas.style.height = `${this._height}px`;
      this._canvas.width = this._width;
      this._canvas.height = this._height;

      // Draw the texture onto the canvas
      this._texture = texture;
      this._context.clearRect(0, 0, this._width, this._height);
      this._context.drawImage(this._texture.image, 0, 0, this._width, this._height);
    }
  }

  /**
   * Updates the position of the cursor mesh based on its coordinates and hotspot.
   */
  private _updatePosition(): void {
    this._canvas.style.left = `${this._x - this._xHot}px`;
    this._canvas.style.top = `${this._y - this._yHot}px`;
  }
}
