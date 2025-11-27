import {Color, LinearSRGBColorSpace} from "three";

/**
 * Utility class for generating colors.
 *
 * This class provides methods to generate random colors or retrieve colors
 * from a predefined palette based on an index.
 */
export class WebXColorGenerator {

  private static _COLOURS = [
    '#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
    '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
    '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
    '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
    '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
    '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
    '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
    '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
    '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
    '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'
  ]

  /**
   * Generates a random color from the predefined palette.
   *
   * @returns A random color as a hexadecimal string.
   */
  public static randomColour(): string {
    const index = Math.floor(Math.random() * WebXColorGenerator._COLOURS.length);
    return WebXColorGenerator._COLOURS[index];
  }

  /**
   * Retrieves a color from the predefined palette based on the given index.
   *
   * If the index exceeds the palette size, it wraps around using modulo.
   *
   * @param index The index of the color to retrieve.
   * @returns The color as a hexadecimal string.
   */
  public static indexedColour(index: number): string {
    index = index % WebXColorGenerator._COLOURS.length;
    return WebXColorGenerator._COLOURS[index];
  }

  /**
   * Converts a string ('#rrggbb' value) or number (hex 0xrrggbb) into a color object
   * with a specified color space
   * @param value the color representation
   * @param colorSpace the color space
   */
  public static toColor(value: number | string, colorSpace?: string): Color {
    colorSpace = colorSpace || LinearSRGBColorSpace;
    if (typeof value === 'number') {
      return new Color().setHex(value, colorSpace);

    } else {
      return new Color().setStyle(value, colorSpace);
    }
  }
}
