import {Box2, Mesh, MeshBasicMaterial, Texture, Vector2} from "three";
import {WebXMaterial} from "../display/WebXMaterial";

export class WebXWindowCanvas {

  private readonly _element: HTMLElement;
  private readonly _canvas: HTMLCanvasElement;
  private _context: CanvasRenderingContext2D;

  private _colorMap: Texture;
  private _colorMapVersion: number = 0;
  private _alphaMap: Texture;
  private _alphaMapVersion: number = 0;

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
    // this._element.style.backgroundColor = WebXColorGenerator.indexedColour(this.id);
    this._element.style.backgroundColor = '#000000';
    this._element.style.pointerEvents = 'none';
    this._element.style.overflow = 'hidden';

    this._canvas = this.createElementNS('canvas') as HTMLCanvasElement;
    this._canvas.style.position = 'absolute';
    this._canvas.style.pointerEvents = 'none';
    this._canvas.style.top = '0';
    this._canvas.style.left = '0';

    this._element.appendChild(this._canvas);

    this._context = this._canvas.getContext("2d");

    this.updateGeometry();
    this.updateCanvas();
  }

  public updateGeometry() {
    const x = this._mesh.position.x - 0.5 * this._mesh.scale.x;
    const y = this._mesh.position.y - 0.5 * this._mesh.scale.y;
    this._element.style.top = `${y}px`;
    this._element.style.left = `${x}px`;
    this._element.style.width = `${this._mesh.scale.x}px`;
    this._element.style.height = `${this._mesh.scale.y}px`;
    this._element.style.zIndex = `${this._mesh.position.z}`;
  }

  public updateCanvas() {
    if (this._mesh.material instanceof WebXMaterial || this._mesh.material instanceof MeshBasicMaterial) {
      const material = this._mesh.material as WebXMaterial | MeshBasicMaterial;

      if (material.map) {
        if (material.map != this._colorMap || material.map.version != this._colorMapVersion) {
          const image = material.map.image;
          this._canvas.width = image.width;
          this._canvas.height = image.height;
          this._canvas.style.width = `${image.width}px`;
          this._canvas.style.height = `${image.height}px`;

          this._context.drawImage(image, 0, 0, image.width, image.height);

          this._colorMap = material.map;
          this._colorMapVersion = material.map.version;
        }

      } else {
        if (this._colorMap) {
          this._colorMap = null;
          this._colorMapVersion = 0;
          this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
        }
      }

    }
  }

  public updateCanvasRegion(src: Texture, dst: Texture, srcRegion?: Box2 | null, dstPosition?: Vector2 | null) {
    if (this._colorMap === dst) {
      const image = src.image;
      const dstX = dstPosition ? dstPosition.x : 0;
      const dstY = dstPosition ? dstPosition.y : 0;
      const srcX = srcRegion ? srcRegion.min.x : 0;
      const srcY = srcRegion ? srcRegion.min.y : 0;
      const srcWidth = srcRegion ? srcRegion.max.x - srcRegion.min.x : image.width;
      const srcHeight = srcRegion ? srcRegion.max.y - srcRegion.min.y : image.height;
      this._context.drawImage(image, srcX, srcY, srcWidth, srcHeight, dstX, dstY, srcWidth, srcHeight)  ;
    }
  }

  private createElementNS(name: string): HTMLElement {
    return document.createElementNS('http://www.w3.org/1999/xhtml', name);
  }
}
