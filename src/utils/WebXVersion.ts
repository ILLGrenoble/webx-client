/**
 * WebXVersion class
 * Encapsulates a version number in the format of major.minor.patch
 */
export class WebXVersion {

  /**
   * The major version number.
   */
  public readonly major: number;

  /**
   * The minor version number.
   */
  public readonly minor: number;

  /**
   * The patch version number.
   */
  public readonly patch: number;

  /**
   * The version string.
   */
  public readonly version: string;

  /**
   * Constructs a new WebXVersion object.
   *
   * @param major The major version number.
   * @param minor The minor version number.
   * @param patch The patch version number.
   */
  constructor(major: number = 0, minor: number = 0, patch: number = 0) {
    this.major = major;
    this.minor = minor;
    this.patch = patch;
    this.version = `${major}.${minor}.${patch}`;
  }
}
