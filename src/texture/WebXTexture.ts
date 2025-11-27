/**
 * WebXTexture
 *
 * Lightweight container for image or raw pixel data that can be transferred
 * between threads (via postMessage) when backed by an ImageBitmap or ArrayBuffer.
 *
 * Holds either an `image` (ImageBitmap | HTMLImageElement) or raw `data` (Uint8ClampedArray).
 */
export class WebXTexture {
  /**
   * Image source when available. May be an ImageBitmap (transferable) or a
   * regular HTMLImageElement.
   */
  image: ImageBitmap | HTMLImageElement;

  /**
   * Raw pixel data (RGBA) when using typed array backing instead of an image.
   */
  data: Uint8ClampedArray;

  /**
   * Whether the texture data should be flipped vertically when uploaded.
   */
  flipY: boolean;

  /**
   * Pixel width of the texture.
   */
  width: number;

  /**
   * Pixel height of the texture.
   */
  height: number;

  /**
   * Create a new WebXTexture.
   *
   * The `data` parameter accepts an object with optional fields:
   * - `image` - an ImageBitmap or HTMLImageElement to use as the texture source.
   * - `data` - a Uint8ClampedArray with raw pixel data (used when `image` is absent).
   * - `width`/`height` - dimensions to use when `image` is not provided.
   *
   * When `image` is provided it takes precedence for `width`/`height`.
   *
   * @param data - Initialization object for the texture.
   */
  constructor(data: {image?: ImageBitmap | HTMLImageElement, data?: Uint8ClampedArray, width?: number, height?: number}) {
    this.image = data.image ? data.image : null;
    this.data = data.data;
    this.width = data.image ? data.image.width : data.width;
    this.height = data.image ? data.image.height : data.height;
    this.flipY = false;
  }

  /**
   * Determine whether the texture contents are transferable (can be sent via
   * postMessage as a Transferable).
   *
   * Returns true if the texture is backed by an ImageBitmap or by a typed
   * array (`data`).
   */
  isTransferable(): boolean {
    return (this.image && this.image instanceof ImageBitmap) || (this.data != null);
  }

  /**
   * Retrieve the Transferable object for posting to another thread.
   *
   * - If backed by an ImageBitmap, the ImageBitmap itself is returned.
   * - If using raw `data`, the underlying ArrayBuffer is returned.
   * - Otherwise returns `null`.
   *
   * @returns The Transferable object or `null` if not transferable.
   */
  get transferable(): Transferable | null {
    if (this.image && this.image instanceof ImageBitmap) {
      return this.image;
    } else if (this.data) {
      return this.data.buffer;
    }
    return null;
  }
}
