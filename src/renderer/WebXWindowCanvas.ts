import {DataTexture, Mesh, MeshBasicMaterial, Texture, Vector2} from "three";
import {WebXMaterial} from "../display/WebXMaterial";
import {WebXImageBlender} from "./WebXImageBlender";

type RegionUpdate = {
  srcColorMap: Texture;
  dstColorMap: Texture;
  srcAlphaMap: Texture;
  dstAlphaMap: Texture;
  width: number;
  height: number;
  dstPosition: Vector2
}

/**
 * The `WebXWindowCanvas` class holds the graphical elements necessary for rendering
 * a specific window in the desktop environment. HTML Canvases are used for rendering image data. Window image data
 * is received in the form of color, alpha and stencil buffers. These are blended to produce the final window image.
 */
export class WebXWindowCanvas {

  private readonly _canvas: HTMLCanvasElement;
  private _context: CanvasRenderingContext2D;

  private _stencilCanvas: HTMLCanvasElement;
  private _stencilContext: CanvasRenderingContext2D;

  private _x: number = 0;
  private _y: number = 0;
  private _zIndex: number = 0;
  private _width: number = 0;
  private _height: number = 0;

  private _colorMap: Texture;
  private _alphaMap: Texture;
  private _stencilMap: Texture;

  private _regionUpdates: RegionUpdate[] = [];

  /**
   * Gets the unique ID of the associated mesh.
   */
  get id(): number {
    return this._mesh.id;
  }

  /**
   * Returns the window canvas
   */
  get canvas(): HTMLCanvasElement {
    return this._canvas;
  }

  /**
   * Returns the left-hand x coordinate of the window
   */
  get x(): number {
    return this._x;
  }

  /**
   * Returns the top y coordinate of the window
   */
  get y(): number {
    return this._y;
  }

  /**
   * Returns the zIndex of the window
   */
  get zIndex(): number {
    return this._zIndex;
  }

  /**
   * Returns the width of the window
   */
  get width(): number {
    return this._width;
  }

  /**
   * Returns the height of the window
   */
  get height(): number {
    return this._height;
  }

  /**
   * Initializes a new `WebXWindowCanvas` for the given window Mesh and Material. The Mesh and Material contains all graphical information
   * necessary to render a window (namely window position, size and z-order), the Mesh Material contains the graphical information (color, alpha and stencil data).
   * @param _mesh - The `Mesh` object representing the window.
   * @param _imageBlender - The image blender instance.
   */
  constructor(private readonly _mesh: Mesh,
              private readonly _imageBlender: WebXImageBlender) {
    this._canvas = this.createElementNS('canvas') as HTMLCanvasElement;
    this._canvas.id = `webx-window-${this.id}`;
    this._canvas.style.position = 'absolute';
    this._canvas.style.pointerEvents = 'none';
    this._canvas.style.top = '0';
    this._canvas.style.left = '0';
    this._canvas.style.overflow = 'hidden';

    this._context = this._canvas.getContext('2d');

    this.updateGeometry();
    this.updateCanvas();
  }

  /**
   * Updates the geometry of the window canvas based on the mesh's properties if any changes are needed.
   */
  public updateGeometry() {
    const width = this._mesh.scale.x;
    const height = this._mesh.scale.y;
    const x = this._mesh.position.x - 0.5 * width;
    const y = this._mesh.position.y - 0.5 * height;
    const zIndex = this._mesh.position.z;

    if (x !== this._x || y !== this._y) {
      this._canvas.style.top = `${y}px`;
      this._canvas.style.left = `${x}px`;
      this._x = x;
      this._y = y;
    }

    if (width !== this._width || height !== this._height) {
      this._canvas.style.width = `${width}px`;
      this._canvas.style.height = `${height}px`;

      this._width = width;
      this._height = height;
    }

    if (zIndex !== this._zIndex) {
      this._canvas.style.zIndex = `${this._mesh.position.z}`;
      this._zIndex = zIndex;
    }
  }

  /**
   * Updates the canvas content using the material textures (color, alpha and stencil buffers)
   * if any changes have occurred.
   */
  public async updateCanvas() {
    if (this._mesh.material instanceof WebXMaterial || this._mesh.material instanceof MeshBasicMaterial) {
      const material = this._mesh.material as WebXMaterial | MeshBasicMaterial;

      // Handle the stencil map
      this.updateStencilMap(material);

      if (material.map?.image) {

        // Check for new color map and/or alpha map
        const updateCanvas = material.map != this._colorMap || material.alphaMap != this._alphaMap;
        if (updateCanvas) {
          this._colorMap = material.map;
          this._alphaMap = material.alphaMap;

          const colorImage = material.map.image;

          const width = colorImage.width;
          const height = colorImage.height;

          if (this._canvas.width !== width || this._canvas.height !== height) {
            this._canvas.width = width;
            this._canvas.height = height;
            this._canvas.style.width = `${width}px`;
            this._canvas.style.height = `${height}px`;
          }

          const hasAlphaMap = this.isValidAlphaMap(material.alphaMap);
          if (hasAlphaMap || this._stencilContext) {
            const alphaImage = material.alphaMap?.image;

            const blendedImageData = await this.blendAlphaAndStencil(colorImage, alphaImage, 0, 0);
            this._context.putImageData(blendedImageData, 0, 0);

          } else {
            this._context.clearRect(0, 0, width, height);
            if (material.map instanceof DataTexture) {
              const imageData = new ImageData(new Uint8ClampedArray(colorImage.data.buffer), colorImage.width, colorImage.height);
              this._context.putImageData(imageData, 0, 0);

            } else {
              this._context.drawImage(colorImage, 0, 0, width, height);
            }
          }
        }

        // Apply any regional updates
        await this.handleRegionUpdates();

      } else {
        if (this._colorMap) {
          this._colorMap = null;
          this._alphaMap = null;
          this._regionUpdates = [];
          this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
        }
      }
    }
  }

  /**
   * Adds a region update to the canvas taking into account the color, alpha and stencil buffers. Here we store a simple
   * array of all the updates necessary for this frame. The updates are taken into account in the next rendering request of the window
   * (and are only applied if the destination buffers have not been replaced).
   * @param srcColorMap - The source color texture.
   * @param dstColorMap - The destination color texture.
   * @param srcAlphaMap - The source alpha texture.
   * @param dstAlphaMap - The destination alpha texture.
   * @param width - The width of the region to update.
   * @param height - The height of the region to update.
   * @param dstPosition - The destination position of the region.
   */
  public addRegionUpdate(srcColorMap: Texture, dstColorMap: Texture, srcAlphaMap: Texture, dstAlphaMap: Texture, width: number, height: number, dstPosition: Vector2) {
    this._regionUpdates.push({
      srcColorMap,
      dstColorMap,
      srcAlphaMap,
      dstAlphaMap,
      width,
      height,
      dstPosition,
    });
  }

  /**
   * Handles all pending region updates for the canvas.  The different buffers (color, alpha and stencil) are blended (in a web
   * worker if available) and then re-rendered into the main canvas of the window. If the window has only a color buffer then this
   * is rendered immediately into the main canvas.
   */
  private async handleRegionUpdates(): Promise<void> {
    for (const region of this._regionUpdates) {
      if (region.dstColorMap === this._colorMap && region.dstAlphaMap === this._alphaMap) {
        const { srcColorMap, srcAlphaMap, width, height, dstPosition } = region;

        const colorImage = srcColorMap.image;
        const alphaImage = srcAlphaMap?.image;
        if (alphaImage || this._stencilContext) {
          const blendedImageData = await this.blendAlphaAndStencil(colorImage, alphaImage, dstPosition.x, dstPosition.y);

          this._context.putImageData(blendedImageData, dstPosition.x, dstPosition.y);

        } else {
          this._context.drawImage(colorImage, 0, 0, width, height, dstPosition.x, dstPosition.y, width, height)  ;
        }
      }
    }

    this._regionUpdates = [];
  }

  /**
   * Checks if the provided alpha map is valid for the canvas (dimensions are equal).
   * @param alphaMap - The alpha texture to validate.
   * @returns `true` if the alpha map is valid, otherwise `false`.
   */
  private isValidAlphaMap(alphaMap: Texture): boolean {
    if (alphaMap) {
      const width = alphaMap.image.width;
      const height = alphaMap.image.height;
      return width === this._canvas.width && height === this._canvas.height;
    }
    return false;
  }

  /**
   * Updates the stencil map for the window if it exists in the material and has changed.
   * @param material - The material of the associated mesh.
   */
  private updateStencilMap(material: WebXMaterial | MeshBasicMaterial) {
    // Get stencil map if it exists, remove it if no longer needed
    if (material instanceof WebXMaterial && material.stencilMap) {
      if (material.stencilMap != this._stencilMap) {
        this._stencilMap = material.stencilMap;

        // Create canvas and context for stencil Image
        const stencilImage = this._stencilMap.image;
        this._stencilCanvas = this.createElementNS('canvas') as HTMLCanvasElement;
        this._stencilCanvas.width = stencilImage.width;
        this._stencilCanvas.height = stencilImage.height;

        this._stencilContext = this._stencilCanvas.getContext('2d', { willReadFrequently: true });
        this._stencilContext.drawImage(stencilImage, 0, 0);
      }

    } else {
      if (this._stencilMap) {
        this._stencilMap = null;
        this._stencilCanvas = null;
        this._stencilContext = null;
      }
    }
  }

  /**
   * Prepares temporary canvases to renderer the image data (jpeg format) into raw pixmaps. The pixmap data for the different
   * images is sent to the blender for processing.
   * @param colorImage - The color image.
   * @param alphaImage - The alpha image.
   * @param dstX - The destination X position.
   * @param dstY - The destination Y position.
   * @returns A promise that resolves to the blended `ImageData`.
   */
  private async blendAlphaAndStencil(colorImage: ImageBitmap, alphaImage: ImageBitmap, dstX: number, dstY: number): Promise<ImageData> {
    if (!alphaImage && !this._stencilContext) {
      return;
    }

    const width = colorImage.width;
    const height = colorImage.height;

    // Create temporary canvas and context for color Image
    const colorCanvas = this.createElementNS('canvas') as HTMLCanvasElement;
    colorCanvas.width = width;
    colorCanvas.height = height;

    const colorContext = colorCanvas.getContext('2d');
    colorContext.drawImage(colorImage, 0, 0);
    const colorImageData = colorContext.getImageData(0, 0, width, height);

    let alphaImageData = null;
    if (alphaImage) {
      // Create temporary canvas and context for alpha Image
      const alphaCanvas = this.createElementNS('canvas') as HTMLCanvasElement;
      alphaCanvas.width = width;
      alphaCanvas.height = height;

      const alphaContext = alphaCanvas.getContext('2d');
      alphaContext.drawImage(alphaImage, 0, 0);
      alphaImageData = alphaContext.getImageData(0, 0, width, height);
    }

    const startTime = performance.now();

    let stencilImageData = null;
    if (this._stencilContext) {
      stencilImageData = this._stencilContext.getImageData(dstX, dstY, width, height);
    }
    const blendedImageData = await this._imageBlender.blendAlphaAndStencil(colorImageData, alphaImageData, stencilImageData);

    const endTime = performance.now();
    // console.log(`Time to blend alpha image = ${(endTime - startTime).toFixed((3))}ms for ${width * height} pixels`);

    return blendedImageData;
  }

  /**
   * Creates an HTML element with the specified namespace.
   * @param name - The name of the element to create.
   * @returns The created `HTMLElement`.
   */
  private createElementNS(name: string): HTMLElement {
    return document.createElementNS('http://www.w3.org/1999/xhtml', name);
  }
}
