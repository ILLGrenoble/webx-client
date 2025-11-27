import {WebXFilter} from "./WebXFilter";
import {WebXTestFilterMaterial} from "./WebXTestFilterMaterial";
import {WebXCRTFilterMaterial} from "./WebXCRTFilterMaterial";
import {WebGLRenderer} from "three";

export class WebXFilterFactory {

  public static Build(renderer: WebGLRenderer, screenWidth: number, screenHeight: number, name: string, params: any): WebXFilter {
    return new WebXFilter(renderer, screenWidth, screenHeight, WebXFilterFactory._createFilterMaterial(name, params));
  }

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
