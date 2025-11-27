import {ShaderMaterial, ShaderMaterialParameters, Texture} from 'three';

/**
 * WebXFilterMaterial
 *
 * Abstract base class for post-process filter materials used by `WebXFilter`.
 * Subclasses should provide a shader-based material that consumes a `tDiffuse`
 * texture and updates any time-dependent or parameter-driven uniforms in `update()`.
 *
 * This class extends Three's `ShaderMaterial` to inherit shader and rendering
 * behavior while enforcing a minimal API required by the filter pipeline.
 */
export abstract class WebXFilterMaterial extends ShaderMaterial {

  /**
   * Construct a new WebXFilterMaterial.
   *
   * The constructor is protected because this class is abstract and intended to
   * be subclassed. Subclasses should call `super(parameters)` to initialize the
   * underlying `ShaderMaterial` with their shader, uniforms and parameters.
   *
   * @param parameters - Optional `ShaderMaterialParameters` forwarded to the `ShaderMaterial` constructor.
   */
  protected constructor(parameters?: ShaderMaterialParameters) {
    super(parameters);
  }

  /**
   * Update per-frame/stateful data used by the material.
   *
   * Called by the owning `WebXFilter` before the filter pass is rendered. Implementations
   * should update time-based uniforms, animation state, or any derived values needed
   * by the shader.
   */
  public abstract update(): void;

  /**
   * Set the diffuse/source texture for the filter.
   *
   * The filter pipeline will provide the texture containing the previously rendered
   * scene (usually an offscreen render target). Implementations must assign the
   * provided `Texture` to the shader uniform used as the input (commonly named `tDiffuse`).
   *
   * @param value - Texture containing the scene to be filtered.
   */
  public abstract set tDiffuse(value: Texture);

}

