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
