1.10.2 07/07/2025
================
 * Fix build

1.10.1 07/07/2025
================
 * make the connectionStatusCallback on the client config optional.

1.10.0 07/07/2025
================
 * Forward connection status to clients through a callback
 * Obtain a session status from the connection message
 * Handle asynchronous session creations
 * Separate ConnectionHandler into a separate file.

1.9.6 02/07/2025
================
 * Handle adding and removing shapes from windows correctly.
 * Ignore null colorMaps (show current one rather than a blank window)
 * Updated README 

1.9.5 13/06/2025
================
 * Ensure that material shader is recompiled when a stencil is added.

1.9.4 12/06/2025
================
 * Allow for unbinding of listeners with guacamole keyboard (add dispose method). Remove event handlers from WebXKeyboard (direct setting inside quacamole keyboard).

1.9.3 11/06/2025
================
 * Fix version build in npm

1.9.2 11/06/2025
================
 * Remove debugging logging in keyboard

1.9.1 11/06/2025
================
 * Fix version numbering

1.9.0 11/06/2025
================
 * Use pure Guacamole keyboard handling (rather than typescript conversion). Ensures that keyboard behaviour is as good as guacamole, fixing/improving keypress activity and removing repeating keys on the remote server.

1.8.1 19/05/2025
================
 * Explicitly set websocket url with the protocol, host and port if it doesn't already have them (older browser versions consider the URL to be invalid otherwise).

1.8.0 07/05/2025
================
 * Read the WebX engine version from the Screen Message (if it is sent).
 * Send the webx-client version (from the package.json) in the websocket connection request.

1.7.1 06/05/2025
================
 * Handle Nop messages (resetting connection timeouts if received)

1.6.1 24/04/2025
================
 * Fix reading max quality index from buffer

1.6.0 24/04/2025
================
 * Read the max quality index in the Screen message (if it exists). Add it as a readonly value in the WebXClient.

1.5.1 23/04/2025
================
 * Fix bug on default value for timeout waiting for connection message.

1.5.0 23/04/2025
================
 * Explicit wait for a Connection message before initialising the display (rather than relying on timeouts from requests to the engine). Requires webx-relay >= 1.2.0.

1.4.4 23/04/2025
================
 * Make client mouse and keyboard optional: VISA for example creates its own mouse and keyboard and associated listeners.

1.4.3 22/04/2025
================
 * Remove cursor log

1.4.1 17/04/2025
================
 * Only update the cursor if it has changed

1.4.0 14/04/2025
================
 * Use LinearSRGBColorSpace for alpha maps (fixes transparency appearing too transparent).

1.3.0 10/04/2025
================
  * Handle separately the cursor position and the cursor icon. 
  * Handle mouse events from the server with negative positions (indicating that only the cursor is to be updated). 
  * Fix some bugs with mouse event handling and state mutation.

1.2.0 07/04/2025
================
  * Add clipboard functionality: send clipboard data to WebX Engine and receive notifications of changes to X11 clipboard.

1.1.0 04/04/2025
================
  * Add screenshot functionality to WebXClient (renders full screen to an image blob of given type and quality).

1.0.0 31/03/2025
================
 * Refactoring: use of public readonly members rather than private readonly with getters
 * Full code documentation
 * Refactoring: use of async/await rather than explicit promises
 * Handling of numlock and numerical keypad

0.10.0 21/03/2025
=================
 * Minor changes, less errors thrown

0.9.0 21/03/2025
================
 * Better handling of closed websockets

0.8.0 18/03/2025
================
 * Move DebugImageMessageHandler to webx-client from webx-demo-client so that it can be re-used in other applications (and removes dependency of three.js and tween.js from other applications). 
 * Remove obsolete socket.io tunnel (and socket.io dependency).
 * Update tween.js dependency. 

0.7.0 18/03/2025
================
 * Handle Quality messages coming from the engine.

0.6.0 12/03/2025
================
 * Remove QoS elements (handled automatically in server from bitrate/latency calculations)

0.5.0 12/03/2025
================
 * Add min cutoff for sending data ack
 * Add timestamp to all message headers
 * Set instruction header to 32 bytes (8 bit alignment). 
 * Handle critical messages immediately after reception from websocket: send pong and data-ack instructions immediately so that the server can calculate accurately the latency and bitrate for the client.

0.4.0 04/03/2025
================
 * Update dependencies (notably three.js up to latest 174)

0.3.0 04/03/2025
================
 * Handle ping messages from engine and send pong response instructions
 * Increase message header to 40 bytes to include client index mask
 * Add extra 4 bytes to instruction header to allow for inclusion of client Id (set by the relay).
 * Clear window refresh timeout on dispose if it exists.

0.2.0 20/02/2025
================
 * Only request a full window update if a partial one has occurred: don't do full update if partial ones are still occurring (wait for 5 seconds of no updates)
 * Remove Poll message
 * Use standard THREE.WebGLRenderer
 * Remove unused classes
 * Update README to fully describe project and usage

0.1.0 17/02/2023
================
 * Initial release
