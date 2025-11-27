import {WebXFilter} from "./WebXFilter";
import {WebXTestFilterMaterial} from "./WebXTestFilterMaterial";
import {WebXCRTFilterMaterial} from "./WebXCRTFilterMaterial";
import {WebGLRenderer} from "three";

/**
 * WebXFilterFactory
 *
 * Factory for creating `WebXFilter` instances. Chooses a filter material by name
 * and constructs a `WebXFilter` configured with the provided renderer and screen
 * dimensions. If an unknown filter name is supplied the returned `WebXFilter`
 * will be created without a filter material (no post-process applied).
 */
export class WebXFilterFactory {

  /**
   * Build a `WebXFilter` configured with a named filter material.
   *
   * @param renderer - Three.js WebGLRenderer used for rendering passes.
   * @param screenWidth - Width in pixels for the offscreen render target and screen plane.
   * @param screenHeight - Height in pixels for the offscreen render target and screen plane.
   * @param name - Name of the filter to create (e.g. `test`, `crt`).
   * @param params - Optional parameters forwarded to the chosen filter material constructor.
   * @returns A `WebXFilter` configured with the selected filter material, or a `WebXFilter` with no filter if the name is unknown.
   */
  public static Build(renderer: WebGLRenderer, screenWidth: number, screenHeight: number, name: string, params: any): WebXFilter {
    return new WebXFilter(renderer, screenWidth, screenHeight, WebXFilterFactory._createFilterMaterial(name, params));
  }

  /**
   * Create an instance of a filter material by name.
   *
   * @param name - Filter name identifier.
   * @param params - Optional parameters passed to the filter material constructor.
   * @returns An instance of the requested filter material, or `null` if the name is unknown.
   */
  private static _createFilterMaterial(name: string, params: any) {
    if (name === 'test') {
      return new WebXTestFilterMaterial();

    } else if (name === 'crt') {
      return new WebXCRTFilterMaterial(params)
    }

    console.log(`Unknown filter ${name}`);
    return null;
  }

}
