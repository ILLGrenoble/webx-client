import * as THREE from 'three';
import { Texture, LinearFilter } from 'three';
import { WebXCursorFactory } from './WebXCursorFactory';

export class WebXCursor {
  private static _PLANE_GEOMETRY: THREE.PlaneGeometry = new THREE.PlaneGeometry(1.0, 1.0, 2, 2);

  private _cursorId: number;
  private _texture: THREE.Texture;
  private readonly _material: THREE.MeshBasicMaterial;
  private readonly _mesh: THREE.Mesh;

  private _x: number;
  private _y: number;
  private _xHot: number = 0;
  private _yHot: number = 0;
  private _width: number = 1;
  private _height: number = 1;

  public get mesh(): THREE.Mesh {
    return this._mesh;
  }

  public get cursorId(): number {
    return this._cursorId;
  }

  public get texture(): Texture {
    return this._texture;
  }

  public set x(value: number) {
    this._x = value;
    this._updatePosition();
  }

  public set y(value: number) {
    this._y = value;
    this._updatePosition();
  }

  constructor(private _cursorFactory: WebXCursorFactory) {
    this._material = new THREE.MeshBasicMaterial({ transparent: true });
    this._material.side = THREE.BackSide;
    this._material.transparent = true;
    this._material.visible = false;

    this._mesh = new THREE.Mesh(WebXCursor._PLANE_GEOMETRY, this._material);

    this._cursorId = 0;
    this._x = 0;
    this._y = 0;
    this._xHot = 0;
    this._yHot = 0;
    this._width = 16;
    this._height = 20;
    this._updateScale();
    this._updatePosition();

    this._cursorFactory.getCursor().then(cursorData => {
      const cursor = cursorData.cursor;
      if (this._cursorId === 0 || this._cursorId === cursor.cursorId)
      this.update(cursorData.x, cursorData.y, cursor.xHot, cursor.yHot, cursor.cursorId, cursor.texture);
    });
  }

  public setPosition(x: number, y: number): void {
    this._x = x;
    this._y = y;

    this._updatePosition();
  }

  public updateCursorId(x: number, y: number, cursorId: number): void {
    this._x = x;
    this._y = y;
    this._cursorId = cursorId;
    this._cursorFactory.getCursor(cursorId).then(cursorData => {
      const cursor = cursorData.cursor;

      if (this._cursorId === 0 || this._cursorId === cursor.cursorId)
      this.update(cursorData.x != null ? cursorData.x : this._x, cursorData.y != null ? cursorData.y : this._y, cursor.xHot, cursor.yHot, cursor.cursorId, cursor.texture);
    });
    this._updatePosition();
  }

  public update(x: number, y: number, xHot: number, yHot: number, cursorId: number, texture: Texture): void {
    this._x = x;
    this._y = y;
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
    }

    this._updateScale();
    this._updatePosition();
  }

  private _updateScale(): void {
    this._mesh.scale.set(this._width, this._height, 1);
  }

  private _updatePosition(): void {
    this._mesh.position.set(this._x - this._xHot + 0.5 * this._width, this._y - this._yHot + 0.5 * this._height, 999);
  }
}
