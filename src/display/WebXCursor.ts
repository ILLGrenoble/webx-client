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
  private static _PLANE_GEOMETRY: THREE.PlaneGeometry = new THREE.PlaneGeometry(1.0, 1.0, 2, 2);

  private _cursorId: number;
  private _texture: THREE.Texture;
  private readonly _material: THREE.MeshBasicMaterial;
  private readonly _mesh: THREE.Mesh;

  private _x: number = -1;
  private _y: number = -1;
  private _xHot: number = 0;
  private _yHot: number = 0;
  private _width: number = 1;
  private _height: number = 1;

  /**
   * Gets the THREE.js mesh representing the cursor.
   *
   * @returns The cursor mesh.
   */
  public get mesh(): THREE.Mesh {
    return this._mesh;
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
   * Gets the texture of the cursor.
   *
   * @returns The cursor texture.
   */
  public get texture(): Texture {
    return this._texture;
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
    this._material = new THREE.MeshBasicMaterial({ transparent: true });
    this._material.side = THREE.BackSide;
    this._material.transparent = true;
    this._material.visible = false;

    this._mesh = new THREE.Mesh(WebXCursor._PLANE_GEOMETRY, this._material);

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
   * @param x The x-coordinate of the cursor.
   * @param y The y-coordinate of the cursor.
   * @param cursorId The ID of the cursor to display.
   */
  public setCursorId(cursorId: number): void {
    this._cursorId = cursorId;
    this._cursorFactory.getCursor(cursorId).then(cursorData => {
      const cursor = cursorData.cursor;

      if (this._x < 0 || this._y < 0) {
        this.setPosition(cursorData.x, cursorData.y);
        console.log(`Setting cursor position to ${cursorData.x}, ${cursorData.y}`);
      }

      this._updateCursor(cursor.xHot, cursor.yHot, cursor.cursorId, cursor.texture);
    });
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

      this._texture = texture;

      this._texture.minFilter = LinearFilter;
      this._texture.repeat.set(this._width / this._texture.image.width, this._height / this._texture.image.height);

      this._material.map = texture;
      this._material.visible = true;
      this._material.needsUpdate = true;

      this._mesh.scale.set(this._width, this._height, 1);
    }
  }

  /**
   * Updates the position of the cursor mesh based on its coordinates and hotspot.
   */
  private _updatePosition(): void {
    this._mesh.position.set(this._x - this._xHot + 0.5 * this._width, this._y - this._yHot + 0.5 * this._height, 999);
  }
}
