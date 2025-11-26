import {ShaderMaterial, ShaderMaterialParameters, Texture} from 'three';

export abstract class WebXFilterMaterial extends ShaderMaterial {

  protected constructor(parameters?: ShaderMaterialParameters) {
    super(parameters);
  }

  public abstract update(): void;
  public abstract set tDiffuse(value: Texture);

}
