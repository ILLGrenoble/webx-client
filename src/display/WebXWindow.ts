import * as THREE from 'three';
import { WebXTextureFactory } from './WebXTextureFactory';
import { Texture, LinearFilter } from 'three';

/**
 * Represents a window in the WebX display.
 * 
 * This class manages the rendering of a single window, including its position,
 * size, and texture updates.
 */
export class WebXWindow {
  public static WINDOW_REFRESH_TIME_MS = 5000;
  private static _PLANE_GEOMETRY: THREE.PlaneGeometry = new THREE.PlaneGeometry(1.0, 1.0, 2, 2);
  private static _COLOR_INDEX = 0;

  private readonly _textureFactory: WebXTextureFactory;
  private readonly _colorIndex: number;
  private readonly _id: number;
  private readonly _material: THREE.MeshBasicMaterial;
  private readonly _mesh: THREE.Mesh;
  private _depth: number;

  private _x: number;
  private _y: number;
  private _z: number;
  private _width: number = 1;
  private _height: number = 1;

  private _windowRefreshTimeout: number = null;

  /**
   * Gets the THREE.js mesh representing the window.
   * 
   * @returns The window mesh.
   */
  public get mesh(): THREE.Mesh {
    return this._mesh;
  }

  get colorIndex(): number {
    return this._colorIndex;
  }

  public get id(): number {
    return this._id;
  }

  public get visible(): boolean {
    return this._material.visible;
  }

  private set visible(visible: boolean) {
    if (this._material.visible !== visible) {
      this._material.visible = visible;
    }
  }

  public get colorMap(): Texture {
    return this._material.map;
  }

  private set colorMap(colorMap: Texture) {
    this._material.map = colorMap;
  }

  get alphaMap(): Texture {
    return this._material.alphaMap;
  }

  private set alphaMap(alphaMap: Texture) {
    this._material.alphaMap = alphaMap;
  }

  public get colorMapValid(): boolean {
    return this.colorMap != null && this.colorMap.image.width === this._width && this.colorMap.image.height === this._height;
  }

  public get depth(): number {
    return this._depth;
  }

  get x(): number {
    return this._x;
  }

  public set x(value: number) {
    this._x = value;
    this._updatePosition();
  }

  get y(): number {
    return this._y;
  }

  public set y(value: number) {
    this._y = value;
    this._updatePosition();
  }

  get z(): number {
    return this._z;
  }

  public set z(value: number) {
    this._z = value;
    this._updatePosition();
  }

  get width(): number {
    return this._width;
  }

  public set width(value: number) {
    this._width = value;
    this._updateScale();
    this._updatePosition();
  }

  get height(): number {
    return this._height;
  }

  public set height(value: number) {
    this._height = value;
    this._updateScale();
    this._updatePosition();
  }

  /**
   * Creates a new instance of WebXWindow.
   * 
   * @param configuration The properties of the window, such as position and size.
   * @param textureFactory The factory used to create textures for the window.
   */
  constructor(configuration: { id: number; x: number; y: number; z: number; width: number; height: number }, textureFactory: WebXTextureFactory) {
    this._textureFactory = textureFactory;
    this._colorIndex = WebXWindow._COLOR_INDEX++;

    // this._material = new THREE.MeshBasicMaterial( { color: WebXColourGenerator.indexedColour(this._colorIndex) } );
    this._material = new THREE.MeshBasicMaterial({ transparent: true });
    this._material.side = THREE.BackSide;

    // Wait for texture before rendering the window
    this.visible = false;

    const { id, x, y, z, width, height } = configuration;
    this._id = id;
    this._mesh = new THREE.Mesh(WebXWindow._PLANE_GEOMETRY, this._material);

    this._x = x;
    this._y = y;
    this._z = z;
    this._width = width;
    this._height = height;
    this._updateScale();
    this._updatePosition();
  }

  /**
   * Loads the window image from the texture factory.
   */
  public async loadWindowImage(): Promise<void> {
    const response = await this._textureFactory.getWindowTexture(this._id);
    this.updateTexture(response.depth, response.colorMap, response.alphaMap, true);
  }

  /**
   * Updates the position and size of the window.
   * 
   * @param x The x-coordinate of the window.
   * @param y The y-coordinate of the window.
   * @param z The z-index of the window.
   * @param width The width of the window.
   * @param height The height of the window.
   */
  public setRectangle(x: number, y: number, z: number, width: number, height: number): void {
    this._x = x;
    this._y = y;
    this._z = z;
    this._width = width;
    this._height = height;

    if (this.colorMap) {
      this.colorMap.repeat.set(this._width / this.colorMap.image.width, this._height / this.colorMap.image.height);

      if (this.alphaMap) {
        this.alphaMap.repeat.set(this._width / this.alphaMap.image.width, this._height / this.alphaMap.image.height);
      }

      // Force reload of image of dimensions differ
      if (this.colorMap.image.width !== this._width || this.colorMap.image.height !== this._height) {
        this.loadWindowImage().then();
      }
    }

    this._updateScale();
    this._updatePosition();
  }

  /**
   * Updates the textures of the window with new image data.
   * 
   * @param depth The depth of the image.
   * @param colorMap The color texture.
   * @param alphaMap The alpha texture.
   * @param isFullWindow Whether to force an update of the textures.
   */
  public updateTexture(depth: number, colorMap: Texture, alphaMap: Texture, isFullWindow: boolean): void {
    this._depth = depth;

    // Dispose of previous texture
    if (colorMap != this.colorMap) {
      this._disposeColorMap();
      this.colorMap = colorMap;
    }

    if (colorMap) {
      colorMap.minFilter = LinearFilter;
      this.colorMap.repeat.set(this._width / this.colorMap.image.width, this._height / this.colorMap.image.height);
      this.visible = true;
      this._material.needsUpdate = true;
    }

    // Only update alpha if it has been sent
    if (alphaMap) {
      if (alphaMap != this.alphaMap) {
        this._disposeAlphaMap();
        this.alphaMap = alphaMap;
      }
      this.alphaMap.minFilter = LinearFilter;
      this.alphaMap.repeat.set(this._width / this.alphaMap.image.width, this._height / this.alphaMap.image.height);
      this._material.needsUpdate = true;

    } else if (depth == 24) {
      this._disposeAlphaMap();
    }

    this._material.transparent = (this.alphaMap != null || depth === 32);

    // Request a window update if it's not a full window
    if (!isFullWindow) {
      if (this._windowRefreshTimeout) {
        clearTimeout(this._windowRefreshTimeout);
        this._windowRefreshTimeout = null;
      }
      this._windowRefreshTimeout = window.setTimeout(() => {
        this._windowRefreshTimeout = null;
        this.loadWindowImage().then();
      }, WebXWindow.WINDOW_REFRESH_TIME_MS);
    }
  }

  /**
   * Updates the scale of the window mesh.
   */
  private _updateScale(): void {
    this._mesh.scale.set(this._width, this._height, 1);
  }

  /**
   * Updates the position of the window mesh.
   */
  private _updatePosition(): void {
    this._mesh.position.set(this._x + 0.5 * this._width, this._y + 0.5 * this._height, this._z);
  }

  /**
   * Disposes of the resources used by the window.
   */
  dispose(): void {
    this._disposeColorMap();
    this._disposeAlphaMap();
    this._material.dispose();
    if (this._windowRefreshTimeout) {
      clearTimeout(this._windowRefreshTimeout);
      this._windowRefreshTimeout = null;
    }
  }

  /**
   * Disposes of the color map texture.
   */
  private _disposeColorMap(): void {
    if (this.colorMap) {
      this.colorMap.dispose();
      this.colorMap = null;
    }
  }

  /**
   * Disposes of the alpha map texture.
   */
  private _disposeAlphaMap(): void {
    if (this.alphaMap) {
      this.alphaMap.dispose();
      this.alphaMap = null;
    }
  }
}
