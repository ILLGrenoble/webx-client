import * as THREE from 'three';

/**
 * Represents a sub-image within a WebX window.
 * 
 * A sub-image is a portion of a window's texture that can be updated independently.
 */
export class WebXSubImage {
  /**
   * The x-coordinate of the sub-image within the window.
   */
  public readonly x: number;

  /**
   * The y-coordinate of the sub-image within the window.
   */
  public readonly y: number;

  /**
   * The width of the sub-image.
   */
  public readonly width: number;

  /**
   * The height of the sub-image.
   */
  public readonly height: number;

  /**
   * The depth of the sub-image (e.g., 24-bit or 32-bit).
   */
  public readonly depth: number;

  /**
   * The color map texture of the sub-image.
   */
  public readonly colorMap: THREE.Texture;

  /**
   * The alpha map texture of the sub-image.
   */
  public readonly alphaMap: THREE.Texture;

  /**
   * Creates a new instance of WebXSubImage.
   * 
   * @param properties The properties of the sub-image, including position, size, and textures.
   */
  constructor(properties: {
    x: number;
    y: number;
    width: number;
    height: number;
    depth: number;
    colorMap: THREE.Texture;
    alphaMap: THREE.Texture;
  }) {
    this.x = properties.x;
    this.y = properties.y;
    this.width = properties.width;
    this.height = properties.height;
    this.depth = properties.depth;
    this.colorMap = properties.colorMap;
    this.alphaMap = properties.alphaMap;
  }
}
