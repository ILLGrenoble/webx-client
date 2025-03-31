import {
  WebXKeyboardModifierState,
  WebXKeyboardUtils,
  WebXKeydownEvent,
  WebXKeyEvent,
  WebXKeyPressEvent,
  WebXKeyUpEvent
} from './keyboard';

/**
 * Represents the keyboard input device in the WebX client.
 * 
 * This class handles keyboard events, such as key presses and releases,
 * and provides methods to interact with the keyboard state.
 */
export class WebXKeyboard {

  private static _NEXT_ID: number = 0;

  /**
   * All modifiers and their states.
   */
  public static modifiers = new WebXKeyboardModifierState();

  /**
   * Set of known platform-specific or browser-specific quirks which must be
   * accounted for to properly interpret key events, even if the only way to
   * reliably detect that quirk is to platform/browser-sniff.
   */
  public static quirks = {
    /**
     * Whether keyup events are universally unreliable.
     */
    keyupUnreliable: false,

    /**
     * Whether the Alt key is actually a modifier for typable keys and is
     * thus never used for keyboard shortcuts.
     */
    altIsTypableOnly: false,

    /**
     * Whether we can rely on receiving a keyup event for the Caps Lock
     * key.
     */
    capsLockKeyupUnreliable: false
  };

  private readonly _keyboardId: number;

  private readonly _eventMarker: string;

  /**
   * The element to use to provide keyboard events
   */
  private readonly _element: HTMLElement | Document;

  /**
   * The state of every key, indexed by keysym. If a particular key is
   * pressed, the value of pressed for that keysym will be true. If a key
   * is not currently pressed, it will not be defined.
   */
  private _pressed: { [index: number]: boolean } = {};

  /**
   * The state of every key, indexed by keysym, for strictly those keys whose
   * status has been indirectly determined through observation of other key
   * events. If a particular key is implicitly pressed, the value of
   * implicitlyPressed for that keysym will be true. If a key
   * is not currently implicitly pressed (the key is not pressed OR the state
   * of the key is explicitly known), it will not be defined.
   */
  private _implicitlyPressed: { [index: number]: boolean } = {};

  /**
   * The last result of calling the onkeydown handler for each key, indexed
   * by keysym. This is used to prevent/allow default actions for key events,
   * even when the onkeydown handler cannot be called again because the key
   * is (theoretically) still pressed.
   */
  private _lastKeydownResult: { [index: number]: boolean } = {};

  /**
   * The keysym most recently associated with a given keycode when keydown
   * fired. This object maps keycodes to keysyms.
   */
  private _recentKeysym: { [key: string]: number } = {};

  /**
   * Timeout before key repeat starts.
   */
  private _keyRepeatTimeout: number = null;

  /**
   * Interval which presses and releases the last key pressed while that
   * key is still being held down.
   */
  private _keyRepeatInterval: number = null;

  private _events: Array<WebXKeyEvent> = [];

  private _keyDownHandler = this._bindKeyDownListener.bind(this);
  private _keyPressHandler = this._bindKeyPressListener.bind(this);
  private _keyUpHandler = this._bindKeyUpListener.bind(this);

  public get pressed() {
    return this._pressed;
  }

  /**
   * Constructs a new WebXKeyboard instance.
   * 
   * @param element The HTML element to attach the keyboard events to.
   */
  constructor(element: HTMLElement | Document) {
    this._element = element;
    this._keyboardId = WebXKeyboard._NEXT_ID++;
    this._eventMarker = '_WEBX_KEYBOARD_HANDLED_BY_' + this._keyboardId;
    this._handleQuirks();
    this._bindListeners();
  }

  /**
   * Disposes of the keyboard instance and removes event listeners.
   */
  dispose(): void {
    this._unbindListeners();
  }

  /**
   * Set quirk flags depending on platform/browser, if such information is available
   */
  private _handleQuirks(): void {
    if (navigator && navigator.platform) {
      // All keyup events are unreliable on iOS (sadly)
      if (navigator.platform.match(/ipad|iphone|ipod/i)) {
        WebXKeyboard.quirks.keyupUnreliable = true;
      }
        // The Alt key on Mac is never used for keyboard shortcuts, and the
      // Caps Lock key never dispatches keyup events
      else if (navigator.platform.match(/^mac/i)) {
        WebXKeyboard.quirks.altIsTypableOnly = true;
        WebXKeyboard.quirks.capsLockKeyupUnreliable = true;
      }
    }
  }

  private _addEvent(event: WebXKeyEvent): void {
    this._events.push(event);
  }

  /**
   * Bind the keyboard listeners to the given element
   */
  private _bindListeners(): void {
    const element = this._element;
    element.addEventListener('keydown', this._keyDownHandler, true);
    element.addEventListener('keypress', this._keyPressHandler, true);
    element.addEventListener('keyup', this._keyUpHandler, true);
  }

  private _unbindListeners(): void {
    const element = this._element;
    element.removeEventListener('keydown', this._keyDownHandler, true);
    element.removeEventListener('keypress', this._keyPressHandler, true);
    element.removeEventListener('keyup', this._keyUpHandler, true);
  }

  private _bindKeyDownListener(event: KeyboardEvent) {
    // Only intercept if handler set
    if (!this.onKeyDown) {
      return;
    }

    // Ignore events which have already been handled
    if (!this._markEvent(event)) {
      return;
    }

    const keyCode = event.which;

    // Fix modifier states
    const keydownEvent = new WebXKeydownEvent(keyCode, event.key, event.key, WebXKeyboard._getEventLocation(event));

    if (keydownEvent.keysym == null) {
      return;
    }

    this._recentKeysym[event.key] = keydownEvent.keysym;

    this._syncModifierStates(event, keydownEvent);

    // Ignore (but do not prevent) the "composition" keycode sent by some
    // browsers when an IME is in use (see: http://lists.w3.org/Archives/Public/www-dom/2010JulSep/att-0182/keyCode-spec.html)
    // if (keyCode === 229) {
    //   return;
    // }

    this._addEvent(keydownEvent);

    // Interpret as many events as possible, prevent default if indicated
    this._interpretEvents();

    event.preventDefault();
    event.stopPropagation();
  }

  private _bindKeyPressListener(event: KeyboardEvent) {

    // Only intercept if handler set
    if (!this.onKeyDown && !this.onKeyUp) {
      return;
    }

    // Ignore events which have already been handled
    if (!this._markEvent(event)) {
      return;
    }

    const charCode = event.which;

    // Fix modifier states
    const keypressEvent = new WebXKeyPressEvent(charCode);

    // if (keypressEvent.keysym == null) {
    //   return;
    // }

    this._syncModifierStates(event, keypressEvent);

    // Log event
    this._addEvent(keypressEvent);

    // Interpret as many events as possible, prevent default if indicated
    this._interpretEvents();

    event.preventDefault();
    event.stopPropagation();
  }

  private _bindKeyUpListener(event: KeyboardEvent) {
    // Only intercept if handler set
    if (!this.onKeyUp) {
      return;
    }

    // Ignore events which have already been handled
    if (!this._markEvent(event)) {
      return;
    }

    event.preventDefault();

    const keyCode = event.which;

    // Fix modifier states
    const keyupEvent = new WebXKeyUpEvent(keyCode, event.key, event.key, WebXKeyboard._getEventLocation(event));

    // if (keyupEvent.keysym == null) {
    //   return;
    // }

    // Fall back to the most recently pressed keysym associated with the
    // keyCode if the inferred key doesn't seem to actually be pressed
    if (!this.pressed[keyupEvent.keysym]) {
      keyupEvent.keysym = this._recentKeysym[event.key] || keyupEvent.keysym;
    }


    // Fall back to the most recently pressed keysym associated with the
    // keyCode if the inferred key doesn't seem to actually be pressed
    if (!this._isKeyPressed(keyupEvent.keysym)) {
      keyupEvent.keysym = this._recentKeysym[keyupEvent.keyCode] || keyupEvent.keysym;
    }

    this._syncModifierStates(event, keyupEvent);

    // Log event, call for interpretation
    this._events.push(keyupEvent);
    this._interpretEvents();
  }

  /**
   * Returns the keyboard location of the key associated with the given
   * keyboard event. The location differentiates key events which otherwise
   * have the same keycode, such as left shift vs. right shift.
   *
   * @param event A JavaScript keyboard event, as received through the DOM via a "keydown", "keyup", or "keypress" handler.
   *
   * @returns {number}
   *     The location of the key event on the keyboard, as defined at:
   *     http://www.w3.org/TR/DOM-Level-3-Events/#events-KeyboardEvent
   */
  private static _getEventLocation(event: KeyboardEvent): number {
    // Use standard location, if possible
    if ('location' in event) {
      return event.location;
    }

    // If no location is available, assume left side
    return 0;
  }

  /**
   * Attempts to mark the given Event as having been handled by this
   * keyboard. If the Event has already been marked as handled,
   * false is returned.
   *
   * @param event The Event to mark.
   * @returns true if the given Event was successfully marked, false if the given
   *     Event was already marked.
   */
  private _markEvent(event: any): boolean {

    // Fail if event is already marked
    if (event[this._eventMarker]) {
      return false;
    }

    // Mark event otherwise
    event[this._eventMarker] = true;

    return true;
  }

  /**
   * Reads through the event log, removing events from the head of the log
   * when the corresponding true key presses are known (or as known as they
   * can be).
   *
   */
  private _interpretEvents(): void {
    // Do not prevent default if no event could be interpreted
    let handledEvent = this._interpretEvent();

    if (!handledEvent) {
      return;
    }

    // Interpret as much as possible
    // let lastEvent;
    do {
      // lastEvent = handledEvent;
      handledEvent = this._interpretEvent();
    } while (handledEvent !== null);

    // Reset keyboard state if we cannot expect to receive any further
    // keyup events
    if (this._isStateImplicit()) {
      this.reset();
    }
  }

  /**
   * Reads through the event log, interpreting the first event, if possible,
   * and returning that event. If no events can be interpreted, due to a
   * total lack of events or the need for more events, null is returned. Any
   * interpreted events are automatically removed from the log.
   *
   * The first key event in the log, if it can be interpreted, or null
   * otherwise.
   */
  private _interpretEvent(): WebXKeyEvent {
    // Peek at first event in log
    const first = this._events[0];

    if (!first) {
      return null;
    }

    // Keydown event
    if (first instanceof WebXKeydownEvent) {
      let keysym = null;
      let acceptedEvents: WebXKeyEvent[] = [];

      // If event itself is reliable, no need to wait for other events
      if (first.reliable) {
        keysym = first.keysym;
        acceptedEvents = this._events.splice(0, 1);
      }

      // If keydown is immediately followed by a keypress, use the indicated character
      else if (this._events[1] instanceof WebXKeyPressEvent) {
        keysym = this._events[1].keysym;
        acceptedEvents = this._events.splice(0, 2);
      }

        // If keydown is immediately followed by anything else, then no
        // keypress can possibly occur to clarify this event, and we must
      // handle it now
      else if (this._events[1]) {
        keysym = first.keysym;
        acceptedEvents = this._events.splice(0, 1);
      }

      // Fire a key press if valid events were found
      if (acceptedEvents.length > 0) {

        if (keysym) {

          // Fire event
          this._releaseSimulatedAltgr(keysym);
          const defaultPrevented = !this.press(keysym);
          this._recentKeysym[first.key] = keysym;

          // Release the key now if we cannot rely on the associated
          // keyup event
          if (!first.keyupReliable) {
            this.release(keysym);
          }

          // Record whether default was prevented
          for (const acceptedEvent of acceptedEvents) {
            acceptedEvent.defaultPrevented = defaultPrevented;
          }

        }

        return first;
      }

    }
    // Keyup event
    else if (first instanceof WebXKeyUpEvent && !WebXKeyboard.quirks.keyupUnreliable) {

      // Release specific key if known
      const keysym = first.keysym;
      if (keysym) {
        this.release(keysym);
        delete this._recentKeysym[first.keyCode];
        first.defaultPrevented = true;
      }
      // Otherwise, fall back to releasing all keys
      else {
        this.reset();
      }

      return this._events.shift();

    }
    // Ignore any other type of event (keypress by itself is invalid, and
    // unreliable keyup events should simply be dumped)
    else {
      return this._events.shift();
    }

    // No event interpreted
    return null;

  }

  /**
   * Releases Ctrl+Alt, if both are currently pressed and the given keysym
   * looks like a key that may require AltGr.
   *
   * @param keysym The key that was just pressed.
   */
  private _releaseSimulatedAltgr(keysym: number) {

    // Both Ctrl+Alt must be pressed if simulated AltGr is in use
    if (!WebXKeyboard.modifiers.ctrl || !WebXKeyboard.modifiers.alt) {
      return;
    }

    // Assume [A-Z] never require AltGr
    if (keysym >= 0x0041 && keysym <= 0x005A) {
      return;
    }

    // Assume [a-z] never require AltGr
    if (keysym >= 0x0061 && keysym <= 0x007A) {
      return;
    }

    // Release Ctrl+Alt if the keysym is printable
    if (keysym <= 0xFF || (keysym & 0xFF000000) === 0x01000000) {
      this.release(0xFFE3); // Left ctrl
      this.release(0xFFE4); // Right ctrl
      this.release(0xFFE9); // Left alt
      this.release(0xFFEA); // Right alt
    }

  }

  /**
   * Returns whether all currently pressed keys were implicitly pressed. A
   * key is implicitly pressed if its status was inferred indirectly from
   * inspection of other key events.
   *
   * @returns {boolean}
   *     true if all currently pressed keys were implicitly pressed, false
   *     otherwise.
   */
  private _isStateImplicit(): boolean {
    for (const keysym in this._pressed) {
      if (!this._isImplicitlyPressed(parseInt(keysym))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if a key is implicitly pressed
   * @param keysym the keysym to check
   */
  private _isImplicitlyPressed(keysym: number): boolean {
    return this._implicitlyPressed[keysym];
  }

  /**
   * Given a keyboard event, updates the local modifier state and remote
   * key state based on the modifier flags within the event. This function
   * pays no attention to keycodes.
   *
   * @param event The keyboard event containing the flags to update.
   *
   * @param keyEvent Current best interpretation of the key event being processed.
   */
  private _syncModifierStates(event: KeyboardEvent, keyEvent: WebXKeyEvent): void {

    // Get state
    const state = WebXKeyboard.modifiers.fromKeyboardEvent(event);

    // Resync state of alt
    this._updateModifierState(WebXKeyboard.modifiers.alt, state.alt, [
      0xFFE9, // Left alt
      0xFFEA, // Right alt
      0xFE03  // AltGr
    ], keyEvent);

    // Resync state of shift
    this._updateModifierState(WebXKeyboard.modifiers.shift, state.shift, [
      0xFFE1, // Left shift
      0xFFE2  // Right shift
    ], keyEvent);

    // Resync state of ctrl
    this._updateModifierState(WebXKeyboard.modifiers.ctrl, state.ctrl, [
      0xFFE3, // Left ctrl
      0xFFE4  // Right ctrl
    ], keyEvent);

    // Resync state of meta
    this._updateModifierState(WebXKeyboard.modifiers.meta, state.meta, [
      0xFFE7, // Left meta
      0xFFE8  // Right meta
    ], keyEvent);

    // Resync state of hyper
    this._updateModifierState(WebXKeyboard.modifiers.hyper, state.hyper, [
      0xFFEB, // Left hyper
      0xFFEC  // Right hyper
    ], keyEvent);

    // Update state
    WebXKeyboard.modifiers = state;

  }

  /**
   * Given the remote and local state of a particular key, resynchronises the
   * remote state of that key with the local state through pressing or
   * releasing keysyms.
   *
   * @param remoteState Whether the key is currently pressed remotely.
   * @param localState  Whether the key is currently pressed locally. If the state
   *                    of the key is not known, this may be undefined.
   * @param keysyms     The keysyms which represent the key being updated.
   * @param keyEvent    Best interpretation of the key event being processed.
   */
  private _updateModifierState(remoteState: boolean, localState: boolean, keysyms: number[], keyEvent: WebXKeyEvent) {

    let i;

    // Do not trust changes in modifier state for events directly involving
    // that modifier: (1) the flag may erroneously be cleared despite
    // another version of the same key still being held and (2) the change
    // in flag may be due to the current event being processed, thus
    // updating things here is at best redundant and at worst incorrect
    if (keysyms.indexOf(keyEvent.keysym) !== -1)
      return;

    // Release all related keys if modifier is implicitly released
    if (remoteState && localState === false) {
      for (i = 0; i < keysyms.length; i++) {
        this.release(keysyms[i]);
      }
    }
    // Press if modifier is implicitly pressed
    else if (!remoteState && localState) {

      // Verify that modifier flag isn't already pressed or already set
      // due to another version of the same key being held down
      for (i = 0; i < keysyms.length; i++) {
        if (this._pressed[keysyms[i]]) {
          return;
        }
      }

      // Mark as implicitly pressed only if there is other information
      // within the key event relating to a different key. Some
      // platforms, such as iOS, will send essentially empty key events
      // for modifier keys, using only the modifier flags to signal the
      // identity of the key.
      const keysym = keysyms[0];
      if (keyEvent.keysym) {
        this._implicitlyPressed[keysym] = true;
      }
      this.press(keysym);
    }
  }

  /**
   * Handle keydown event
   * @param keysym the key symbol
   */
  private _handleKeyDown(keysym: number): boolean {
    this.onKeyDown(keysym);
    return true;
  }

  /**
   * Clear the key repeat timers
   */
  private _clearKeyRepeatTimers(): void {
    clearTimeout(this._keyRepeatTimeout);
    clearInterval(this._keyRepeatInterval);
  }

  /**
   * Checks to see if a key is pressed
   * @param keysym the key to check
   */
  private _isKeyPressed(keysym: number): boolean {
    return this._pressed[keysym];
  }

  /**
   * Resets the state of this keyboard
   */
  public reset(): void {
    for (const keysym in this._pressed) {
      this.release(parseInt(keysym));
    }

  }

  /**
   * Presses and releases the keys necessary to tpe the given string of characters
   * @param message the string to type
   */
  public type(message: string): void {
    // Press/release the key corresponding to each character in the string
    for (let i = 0; i < message.length; i++) {

      // Determine keysym of current character
      const codepoint = message.codePointAt ? message.codePointAt(i) : message.charCodeAt(i);
      const keysym = WebXKeyboardUtils.keysymFromCharCode(codepoint);

      // Press and release key for current character
      this.press(keysym);
      this.release(keysym);
    }

  }

  /**
   * Marks a key as pressed, firing the keydown event if registered. Key repeat for the pressed
   * key will start after a delay if that key is not a modifier.
   * The return value of this function depends on the return value of the keydown event handler, if any.
   * @param keysym the keysym of the key to press
   * @return {boolean} true if event should not be canceled, false otherwise.
   */
  public press(keysym: number): boolean {

    if (keysym) {
      // Mark key as pressed
      if (!this._isKeyPressed(keysym)) {
        this._pressed[keysym] = true;
      }

      // Send key event
      if (this.onKeyDown) {
        const result = this._handleKeyDown(keysym);
        this._lastKeydownResult[keysym] = result;
        // Stop any current repeat
        window.clearTimeout(this._keyRepeatTimeout);
        window.clearInterval(this._keyRepeatInterval);

        // Repeat after a delay as long as pressed
        if (!WebXKeyboardUtils.isKeyRepeatable(keysym))
          this._keyRepeatTimeout = window.setTimeout(() => {
            this._keyRepeatInterval = window.setInterval(() => {
              this.onKeyUp(keysym);
              this.onKeyDown(keysym);
            }, 50);
          }, 500);

        return result;

      }
    }
  }

  /**
   * Marks a key as released, firing the keyup event if registered
   * @param keysym the keysym of the key to release.
   */
  public release(keysym: number): void {
    // Only release if pressed
    if (this._isKeyPressed(keysym)) {

      // Mark key as released
      delete this._pressed[keysym];
      delete this._implicitlyPressed[keysym];

      // Stop repeat
      this._clearKeyRepeatTimers();

      // Send key event
      if (keysym !== null && this.onKeyUp) {
        this.onKeyUp(keysym);
      }

    }
  }

  /**
   * Fired whenever the user presses a key with the element associated
   * with this keyboard in focus.
   *
   * @param key The key being pressed
   */
  public onKeyDown: (key: any) => void = null;

  /**
   * Fired whenever the user releases a key with the element associated
   * with this keyboard in focus.
   *
   * @param key The key being released
   */
  public onKeyUp: (key: any) => void = null;

}
