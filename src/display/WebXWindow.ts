import * as THREE from 'three';
import { WebXTextureFactory } from './WebXTextureFactory';
import { WebXMaterial } from './WebXMaterial';
import { Texture, LinearFilter } from 'three';
import {WebXEngine} from "../WebXEngine";

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
  private readonly _material: WebXMaterial;
  private readonly _mesh: THREE.Mesh;
  private _depth: number;

  private _x: number;
  private _y: number;
  private _z: number;
  private _width: number = 1;
  private _height: number = 1;
  private _shaped: boolean = false;

  private _windowRefreshTimeout: number = null;

  /**
   * Gets the THREE.js mesh representing the window.
   *
   * @returns The window mesh.
   */
  public get mesh(): THREE.Mesh {
    return this._mesh;
  }

  /**
   * Gets the color index of the window.
   *
   * @returns The color index as a number.
   */
  get colorIndex(): number {
    return this._colorIndex;
  }

  /**
   * Gets the unique ID of the window.
   *
   * @returns The window ID as a number.
   */
  public get id(): number {
    return this._id;
  }

  /**
   * Gets the visibility status of the window.
   *
   * @returns True if the window is visible, false otherwise.
   */
  public get visible(): boolean {
    return this._material.visible;
  }

  /**
   * Sets the visibility status of the window.
   *
   * @param visible True to make the window visible, false to hide it.
   */
  private set visible(visible: boolean) {
    if (this._material.visible !== visible) {
      this._material.visible = visible;
    }
  }

  /**
   * Gets the color map texture of the window.
   *
   * @returns The color map as a Texture.
   */
  public get colorMap(): Texture {
    return this._material.map;
  }

  /**
   * Sets the color map texture of the window.
   *
   * @param colorMap The new color map as a Texture.
   */
  private set colorMap(colorMap: Texture) {
    this._material.map = colorMap;
  }

  /**
   * Gets the alpha map texture of the window.
   *
   * @returns The alpha map as a Texture.
   */
  get alphaMap(): Texture {
    return this._material.alphaMap;
  }

  /**
   * Sets the alpha map texture of the window.
   *
   * @param alphaMap The new alpha map as a Texture.
   */
  private set alphaMap(alphaMap: Texture) {
    this._material.alphaMap = alphaMap;
  }

  /**
   * Gets the stencil map texture of the window.
   *
   * @returns The stencil map as a Texture.
   */
  get stencilMap(): Texture {
    return this._material.stencilMap;
  }

  /**
   * Sets the stencil map texture of the window.
   *
   * @param stencilMap The new stencil map as a Texture.
   */
  private set stencilMap(stencilMap: Texture) {
    this._material.stencilMap = stencilMap;
  }

  /**
   * Checks if the color map is valid.
   *
   * @returns True if the color map is valid, false otherwise.
   */
  public get colorMapValid(): boolean {
    return this.colorMap != null && this.colorMap.image.width === this._width && this.colorMap.image.height === this._height;
  }

  /**
   * Gets the depth of the window.
   *
   * @returns The depth as a number.
   */
  public get depth(): number {
    return this._depth;
  }

  /**
   * Gets the x-coordinate of the window.
   *
   * @returns The x-coordinate as a number.
   */
  get x(): number {
    return this._x;
  }

  /**
   * Sets the x-coordinate of the window.
   *
   * @param value The new x-coordinate as a number.
   */
  public set x(value: number) {
    this._x = value;
    this._updatePosition();
  }

  /**
   * Gets the y-coordinate of the window.
   *
   * @returns The y-coordinate as a number.
   */
  get y(): number {
    return this._y;
  }

  /**
   * Sets the y-coordinate of the window.
   *
   * @param value The new y-coordinate as a number.
   */
  public set y(value: number) {
    this._y = value;
    this._updatePosition();
  }

  /**
   * Gets the z-index of the window.
   *
   * @returns The z-index as a number.
   */
  get z(): number {
    return this._z;
  }

  /**
   * Sets the z-index of the window.
   *
   * @param value The new z-index as a number.
   */
  public set z(value: number) {
    this._z = value;
    this._updatePosition();
  }

  /**
   * Gets the width of the window.
   *
   * @returns The width as a number.
   */
  get width(): number {
    return this._width;
  }

  /**
   * Sets the width of the window.
   *
   * @param value The new width as a number.
   */
  public set width(value: number) {
    this._width = value;
    this._updateScale();
    this._updatePosition();
  }

  /**
   * Gets the height of the window.
   *
   * @returns The height as a number.
   */
  get height(): number {
    return this._height;
  }

  /**
   * Sets the height of the window.
   *
   * @param value The new height as a number.
   */
  public set height(value: number) {
    this._height = value;
    this._updateScale();
    this._updatePosition();
  }

  /**
   * Gets whether the window is shaped (has a stencil map).
   *
   * @return True if the window is shaped, false otherwise.
   */
  get shaped(): boolean {
    return this._shaped;
  }

  /**
   * Sets whether the window is shaped (has a stencil map).
   * @param value True to indicate the window is shaped, false otherwise.
   */
  set shaped(value: boolean) {
    this._shaped = value;
    if (!value) {
      this.updateStencilTexture(null);
    }
  }

  /**
   * Creates a new instance of WebXWindow.
   *
   * @param configuration The properties of the window, such as position and size.
   * @param textureFactory The factory used to create textures for the window.
   */
  constructor(configuration: { id: number; x: number; y: number; z: number; width: number; height: number; shaped: boolean }, textureFactory: WebXTextureFactory) {
    this._textureFactory = textureFactory;
    this._colorIndex = WebXWindow._COLOR_INDEX++;

    // this._material = new THREE.MeshBasicMaterial({ transparent: true });
    // this._material.side = THREE.BackSide;
    this._material = new WebXMaterial();

    // Wait for texture before rendering the window
    this.visible = false;

    const { id, x, y, z, width, height, shaped } = configuration;
    this._id = id;
    this._mesh = new THREE.Mesh(WebXWindow._PLANE_GEOMETRY, this._material);
    this._mesh.onBeforeRender = () => this._material.onBeforeRender();

    this._x = x;
    this._y = y;
    this._z = z;
    this._width = width;
    this._height = height;
    this._shaped = shaped && WebXEngine.version.versionNumber >= 1.4;
    this._updateScale();
    this._updatePosition();
  }

  /**
   * Loads the window image from the texture factory.
   */
  public async loadWindowImage(): Promise<void> {
    const response = await this._textureFactory.getWindowTexture(this._id);
    if (response) {
      this.updateTexture(response.depth, response.colorMap, response.alphaMap, true);
    }
  }

  /**
   * Loads the window shape (stencil map) from the texture factory.
   */
  public async loadWindowShape(): Promise<void> {
    const response = await this._textureFactory.getWindowStencilTexture(this._id);
    if (response) {
      this.updateStencilTexture(response.stencilMap);
    } else {
      this._shaped = false;
      this.visible = this.colorMap != null;
    }
  }

  /**
   * Loads the window image and shape (if needed) from the texture factory.
   */
  public async loadWindowImageAndShape(): Promise<void> {
    if (this._shaped) {
      const imagePromise = this.loadWindowImage();
      const shapePromise = this.loadWindowShape();
      await Promise.all([imagePromise, shapePromise]);

    } else {
      return this.loadWindowImage();
    }
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
        this.loadWindowImageAndShape();
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
    // Ignore null color maps (engine unable to get the window image
    if (colorMap == null) {
      return;
    }

    this._depth = depth;

    // Dispose of previous texture
    if (colorMap != this.colorMap) {
      this._disposeColorMap();
      this.colorMap = colorMap;
    }

    colorMap.minFilter = LinearFilter;
    this.colorMap.repeat.set(this._width / this.colorMap.image.width, this._height / this.colorMap.image.height);
    this.visible = (!this._shaped || this.stencilMap != null);
    this._material.needsUpdate = true;

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
   * Updates the stencil map texture of the window with new image data.
   *
   * @param stencilMap The stencil map texture.
   */
  public updateStencilTexture(stencilMap: Texture): void {
    // Dispose of previous texture
    const oldShaped = this._shaped;
    if (stencilMap != this.stencilMap) {
      this._disposeStencilMap();
      this.stencilMap = stencilMap;
    }

    if (stencilMap) {
      stencilMap.minFilter = LinearFilter;
      this.visible = this.colorMap != null;
      this._material.needsUpdate = true;
      this._shaped = true;

    } else {
      this._shaped = false;
      // Recompile the material if the shape has been removed
      if (oldShaped) {
        this._material.needsUpdate = true;
      }
    }
  }

  /**
   * Updates the scale of the window mesh based on its width and height.
   */
  private _updateScale(): void {
    this._mesh.scale.set(this._width, this._height, 1);
  }

  /**
   * Updates the position of the window mesh based on its x, y, and z coordinates.
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
    this._disposeStencilMap();
    this._material.dispose();
    if (this._windowRefreshTimeout) {
      clearTimeout(this._windowRefreshTimeout);
      this._windowRefreshTimeout = null;
    }
  }

  /**
   * Disposes of the color map texture, releasing its resources.
   */
  private _disposeColorMap(): void {
    if (this.colorMap) {
      this.colorMap.dispose();
      this.colorMap = null;
    }
  }

  /**
   * Disposes of the alpha map texture, releasing its resources.
   */
  private _disposeAlphaMap(): void {
    if (this.alphaMap) {
      this.alphaMap.dispose();
      this.alphaMap = null;
    }
  }

  /**
   * Disposes of the stencil map texture, releasing its resources.
   */
  private _disposeStencilMap(): void {
    if (this.stencilMap) {
      this.stencilMap.dispose();
      this.stencilMap = null;
    }
  }
}
