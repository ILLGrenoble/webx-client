/**
 * Enum representing the types of WebX messages.
 *
 * These types are used to categorize messages received from the WebX Engine.
 */
export enum WebXMessageType {

  /**
   * Message indicating no operation.
   */
  NOP = 0,

  /**
   * Message indicating a connection event (handled by the WebX Relay).
   */
  CONNECTION = 1,

  /**
   * Message containing information about visible windows.
   */
  WINDOWS = 2,

  /**
   * Message containing image data for a window.
   */
  IMAGE = 3,

  /**
   * Message containing screen information.
   */
  SCREEN = 4,

  /**
   * Message containing sub-image data for a window.
   */
  SUBIMAGES = 5,

  /**
   * Message containing mouse state updates.
   */
  MOUSE = 6,

  /**
   * Message containing cursor image data.
   */
  CURSOR_IMAGE = 7,

  /**
   * Ping message for connection health checks.
   */
  PING = 8,

  /**
   * Message indicating a disconnection event (handled by the WebX Relay).
   */
  DISCONNECT = 9,

  /**
   * Message containing quality-related information.
   */
  QUALITY = 10,

  /**
   * Message containing current clipboard content.
   */
  CLIPBOARD = 11,

  /**
   * Message containing window shape information (stencil image).
   */
  SHAPE = 12,

  /**
   * Message containing window resize information.
   */
  SCREEN_RESIZE = 13,

  /**
   * Message containing keyboard layout name
   */
  KEYBOARD_LAYOUT = 14,
}
