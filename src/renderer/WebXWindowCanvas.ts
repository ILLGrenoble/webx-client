import {Mesh, MeshBasicMaterial, Texture, Vector2} from "three";
import {WebXMaterial} from "../display/WebXMaterial";

export class WebXWindowCanvas {

  private readonly _element: HTMLElement;
  private readonly _canvas: HTMLCanvasElement;
  private _context: CanvasRenderingContext2D;

  private _x: number = 0;
  private _y: number = 0;
  private _zIndex: number = 0;
  private _width: number = 0;
  private _height: number = 0;

  private _colorMap: Texture;
  private _alphaMap: Texture;

  get id(): number {
    return this._mesh.id;
  }

  get element(): HTMLElement {
    return this._element;
  }

  get colorMap(): Texture {
    return this._colorMap;
  }

  get alphaMap(): Texture {
    return this._alphaMap;
  }

  constructor(private readonly _mesh: Mesh) {
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

    this._context = this._canvas.getContext("2d", { willReadFrequently: true });

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

  public updateCanvas() {
    if (this._mesh.material instanceof WebXMaterial || this._mesh.material instanceof MeshBasicMaterial) {
      const material = this._mesh.material as WebXMaterial | MeshBasicMaterial;

      if (material.map) {
        const colorImage = material.map.image;

        if (material.map != this._colorMap) {

          const width = colorImage.width;
          const height = colorImage.height;

          this._canvas.width = width;
          this._canvas.height = height;
          this._canvas.style.width = `${width}px`;
          this._canvas.style.height = `${height}px`;
          this._context.drawImage(colorImage, 0, 0, width, height);

          this._colorMap = material.map;
          // Reset alpha map to force blending
          this._alphaMap = null;
        }

        if (material.alphaMap != this._alphaMap && this.isValidAlphaMap(material.alphaMap)) {
          const alphaImage = material.alphaMap.image;

          this.blendAlpha(alphaImage, 0, 0);

          this._alphaMap = material.alphaMap;
        }

      } else {
        if (this._colorMap) {
          this._colorMap = null;
          this._alphaMap = null;
          this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
        }
      }
    }
  }

  public updateColorRegion(src: Texture, dstPosition: Vector2) {
    const image = src.image;
    const width = image.width;
    const height = image.height;
    const offsetX = dstPosition.x;
    const offsetY = dstPosition.y;
    this._context.drawImage(image, 0, 0, width, height, offsetX, offsetY, width, height)  ;
  }

  public updateAlphaRegion(src: Texture, dstPosition: Vector2) {
    const image = src.image;
    const offsetX = dstPosition.x;
    const offsetY = dstPosition.y;
    this.blendAlpha(image, offsetX, offsetY);
  }

  private isValidAlphaMap(alphaMap: Texture): boolean {
    if (alphaMap) {
      const width = alphaMap.image.width;
      const height = alphaMap.image.height;
      return width === this._canvas.width && height === this._canvas.height;
    }
    return false;
  }

  private blendAlpha(alphaImage: ImageBitmap, offsetX: number, offsetY: number) {
    if (!alphaImage) {
      return;
    }

    const width = alphaImage.width;
    const height = alphaImage.height;

    const alphaCanvas = this.createElementNS('canvas') as HTMLCanvasElement;
    alphaCanvas.width = width;
    alphaCanvas.height = height;

    const alphaContext = alphaCanvas.getContext("2d", {willReadFrequently: true});
    alphaContext.drawImage(alphaImage, 0, 0);

    const startTime = performance.now();

    const colorImageData = this._context.getImageData(offsetX, offsetY, width, height);
    const alphaImageData = alphaContext.getImageData(0, 0, width, height);

    // Works but may be slow
    for (let i = 0; i < colorImageData.data.length; i += 4) {
      colorImageData.data[i + 3] = alphaImageData.data[i + 1];
    }

    // Blending (Works but may not be super quick either)
    // const colorArray = new Uint32Array(colorImageData.data.buffer);
    // const alphaArray = new Uint32Array(alphaImageData.data.buffer);
    // for (let i = 0; i < colorArray.length; i++) {
    //   // Blend color RGB with bit-shifted G of alpha
    //   colorArray[i] = (colorArray[i] & 0x00FFFFFF) | ((alphaArray[i] & 0x0000FF00) << 16);
    // }

    this._context.putImageData(colorImageData, offsetX, offsetY);

    const endTime = performance.now();
    console.log(`Time to add alpha channel = ${(endTime - startTime).toFixed((3))}ms for ${width * height} pixels`);
  }

  private createElementNS(name: string): HTMLElement {
    return document.createElementNS('http://www.w3.org/1999/xhtml', name);
  }
}
