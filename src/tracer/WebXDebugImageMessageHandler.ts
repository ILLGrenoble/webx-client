import { Object3D, Scene, PlaneGeometry, MeshBasicMaterial, BackSide, Mesh } from 'three';
import { Tween, Group, Easing } from '@tweenjs/tween.js';
import { WebXColorGenerator } from "../utils";
import { WebXDisplay } from "../display";
import { WebXImageMessage, WebXMessage, WebXMessageType, WebXSubImagesMessage } from "../message";
import { WebXMessageHandler } from "./WebXMessageHandler";
import { WebXHandler } from "./WebXHandler";

/**
 * Handles debug image messages for the WebX client.
 * This class is responsible for rendering debug images in a 3D scene
 * and managing their lifecycle.
 */
export class WebXDebugImageMessageHandler extends WebXMessageHandler implements WebXHandler {

  /**
   * Geometry used for creating debug image planes.
   */
  private static _PLANE_GEOMETRY: PlaneGeometry = new PlaneGeometry(1.0, 1.0, 2, 2);

  private _scene: Scene;
  private _debugLayer: Object3D = new Object3D();
  private _currentZ = 0;
  private _disposed = false;
  private _tweenGroup = new Group();

  /**
   * Constructs a new WebXDebugImageMessageHandler.
   * @param _display The WebX display instance used for rendering.
   */
  constructor(private _display: WebXDisplay) {
    super();
    this._debugLayer.position.set(0, 0, 999);
    this._scene = this._display.scene;
    this._scene.add(this._debugLayer);

    this._animate();
  }

  /**
   * Creates a mesh for rendering a debug image.
   * @param x The x-coordinate of the mesh.
   * @param y The y-coordinate of the mesh.
   * @param width The width of the mesh.
   * @param height The height of the mesh.
   * @param colour The color of the mesh.
   */
  private _createMesh(x: number, y: number, width: number, height: number, colour: string): void {
    const material = new MeshBasicMaterial({ color: colour, opacity: 0.8, transparent: true });
    material.side = BackSide;

    const mesh = new Mesh(WebXDebugImageMessageHandler._PLANE_GEOMETRY, material);
    mesh.position.set(x + width / 2, y + height / 2, this._currentZ);
    mesh.scale.set(width, height, 1);
    this._currentZ += 0.0001;
    this._debugLayer.add(mesh);

    new Tween(material, this._tweenGroup)
      .to({ opacity: 0.0 }, 500)
      .easing(Easing.Quadratic.Out)
      .onComplete(() => this._debugLayer.remove(mesh))
      .onUpdate(() => this._display.sceneDirty = true)
      .start();
  }

  /**
   * Handles an incoming WebX message.
   * @param message The WebX message to handle.
   */
  handle(message: WebXMessage): void {

    if (message.type === WebXMessageType.IMAGE) {
      const imageMessage = message as WebXImageMessage;
      const window = this._display.getWindow(imageMessage.windowId);
      const { width, height } = imageMessage.colorMap.image;

      this._createMesh(window.x, window.y, width, height, WebXColorGenerator.indexedColour(window.colorIndex));

    } else if (message.type === WebXMessageType.SUBIMAGES) {
      const subImageMessage = message as WebXSubImagesMessage;
      const window = this._display.getWindow(subImageMessage.windowId);

      subImageMessage.subImages.forEach(subImage => {
        this._createMesh(window.x + subImage.x, window.y + subImage.y, subImage.width, subImage.height, WebXColorGenerator.indexedColour(window.colorIndex));
      });
    }
  }

  /**
   * Cleans up resources used by this handler.
   */
  destroy(): void {
    this._disposed = true;

    this._debugLayer.children.forEach((child: Mesh) => {
      const material = child.material as MeshBasicMaterial;
      material.dispose();
    });

    this._debugLayer.clear();
    this._debugLayer.removeFromParent();
  }

  /**
   * Animates the debug layer.
   */
  private _animate(): void {
    if (!this._disposed) {
      requestAnimationFrame((time) => {
        this._tweenGroup.update(time);
        this._animate();
      });
    }
  }

}
