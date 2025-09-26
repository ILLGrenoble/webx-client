import {Material, Mesh, MeshBasicMaterial, Texture, Vector2} from "three";
import {WebXMaterial} from "../display/WebXMaterial";
import {WebXAlphaStencilBlender} from "./WebXAlphaStencilBlender";

type RegionUpdate = {
  srcColorMap: Texture;
  dstColorMap: Texture;
  srcAlphaMap: Texture;
  dstAlphaMap: Texture;
  width: number;
  height: number;
  dstPosition: Vector2
}

export class WebXWindowCanvas {

  private readonly _element: HTMLElement;
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

  get id(): number {
    return this._mesh.id;
  }

  get element(): HTMLElement {
    return this._element;
  }

  constructor(private readonly _mesh: Mesh,
              private readonly _alphaStencilBlender: WebXAlphaStencilBlender) {
    this._element = this.createElementNS('div');
    this._element.id = `webx-window-${this.id}`;
    this._element.style.position = 'absolute';
    this._element.style.pointerEvents = 'none';
    this._element.style.overflow = 'hidden';

    this._canvas = this.createElementNS('canvas') as HTMLCanvasElement;
    this._canvas.style.position = 'absolute';
    this._canvas.style.pointerEvents = 'none';
    this._canvas.style.top = '0';
    this._canvas.style.left = '0';

    this._element.appendChild(this._canvas);

    this._context = this._canvas.getContext('2d');

    this.updateGeometry();
    this.updateCanvas();
  }

  public updateGeometry() {
    const width = this._mesh.scale.x;
    const height = this._mesh.scale.y;
    const x = this._mesh.position.x - 0.5 * width;
    const y = this._mesh.position.y - 0.5 * height;
    const zIndex = this._mesh.position.z;

    if (x !== this._x || y !== this._y) {
      this._element.style.top = `${y}px`;
      this._element.style.left = `${x}px`;
      this._x = x;
      this._y = y;
    }

    if (width !== this._width || height !== this._height) {
      this._element.style.width = `${width}px`;
      this._element.style.height = `${height}px`;

      this._width = width;
      this._height = height;
    }

    if (zIndex !== this._zIndex) {
      this._element.style.zIndex = `${this._mesh.position.z}`;
      this._zIndex = zIndex;
    }
  }

  public async updateCanvas() {
    if (this._mesh.material instanceof WebXMaterial || this._mesh.material instanceof MeshBasicMaterial) {
      const material = this._mesh.material as WebXMaterial | MeshBasicMaterial;

      // Handle the stencil map
      this.updateStencilMap(material);

      if (material.map) {

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
            this._context.drawImage(colorImage, 0, 0, width, height);
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

  private isValidAlphaMap(alphaMap: Texture): boolean {
    if (alphaMap) {
      const width = alphaMap.image.width;
      const height = alphaMap.image.height;
      return width === this._canvas.width && height === this._canvas.height;
    }
    return false;
  }

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
    const blendedImageData = await this._alphaStencilBlender.blendAlphaAndStencil(colorImageData, alphaImageData, stencilImageData);

    const endTime = performance.now();
    console.log(`Time to blend alpha image = ${(endTime - startTime).toFixed((3))}ms for ${width * height} pixels`);

    return blendedImageData;
  }

  private createElementNS(name: string): HTMLElement {
    return document.createElementNS('http://www.w3.org/1999/xhtml', name);
  }
}
