# WebX Client

## Description

The WebX Client provides a javascript library to render a WebX Remote Desktop using a websocket connected to the [WebX Relay](https://github.com/ILLGrenoble/webx-relay) in a backend server. It also providers listeners for mouse and keyboard events to be sent as instructions to the [WebX Engine](https://github.com/ILLGrenoble/webx-engine) that is connected to the remote X11 display.

Instructions are sent to the server via the websocket to initially determine display configuration (width, height) and window layout. Most display updates occur via events pushed through the websocket from the server.

All data sent over the websocket is in binary format as an optimisation (eg avoid base64 conversion of image data).

Two websocket tunnels are available for use: the standard websocket or a socket.io websocket. Since data is sent in binary format the standard websocket is recommended rather than socket.io for better performance. 

WebGL is used to render the Remote Desktop (using the three.js library): textures for individual X11 windows and generated and updated directly from JPEG data sent from WebX Engine running the WebX host. 

To account for varying bandwidths between the client and the remote desktop, the client can request different quality settings. For lower quality, this will for example reduce the image quality and reduce the frequency of window updates.

The client also provides a means of tracing events namely message events (received from the server), instruction events (sent to the server) and stats events (data rates). This can be useful for monitoring the WebX Client, an example of which is used in the [WebX Demo Client](https://github.com/ILLGrenoble/webx-demo-client) that provides a debugging console

## WebX Overview

WebX is a Remote Desktop technology allowing an X11 desktop to be rendered in a user's browser. It's aim is to allow a secure connection between a user's browser and a remote linux machine such that the user's desktop can be displayed and interacted with, ideally producing the effect that the remote machine is behaving as a local PC.

WebX's principal differentiation to other Remote Desktop technologies is that it manages individual windows within the display rather than treating the desktop as a single image. A couple of advantages with a window-based protocol is that window movement events are efficiently passed to clients (rather than graphically updating regions of the desktop) and similarly it avoids <em>tearing</em> render effects during the movement. WebX aims to optimise the flow of data from the window region capture, the transfer of data and client rendering.

> The full source code is openly available and the technology stack can be (relatively) easily demoed but it should be currently considered a work in progress.

The WebX remote desktop stack is composed of a number of different projects:
- [WebX Engine](https://github.com/ILLGrenoble/webx-engine) The WebX Engine is the core of WebX providing a server that connects to an X11 display obtaining window parameters and images. It listens to X11 events and forwards event data to connected clients. Remote clients similarly interact with the desktop and the actions they send to the WebX Engine are forwarded to X11.
- [WebX Router](https://github.com/ILLGrenoble/webx-router) The WebX Router manages multiple WebX sessions on single host, routing traffic between running WebX Engines and the WebX Relay.
- [WebX Session Manager](https://github.com/ILLGrenoble/webx-session-manager) The WebX Session manager is used by the WebX Router to authenticate and initiate new WebX sessions. X11 displays and desktop managers are spawned when new clients successfully authenticate.
- [WebX Relay](https://github.com/ILLGrenoble/webx-relay) The WebX Relay provides a Java library that can be integrated into the backend of a web application, providing bridge functionality between WebX host machines and client browsers. TCP sockets (using the ZMQ protocol) connect the relay to host machines and websockets connect the client browsers to the relay. The relay transports data between a specific client and corresponding WebX Router/Engine.
- [WebX Client](https://github.com/ILLGrenoble/webx-client) The WebX Client is a javascript package (available via NPM) that provides rendering capabilities for the remote desktop and transfers user input events to the WebX Engine via the relay.

To showcase the WebX technology, a demo is available. The demo also allows for simplified testing of the WebX remote desktop stack. The projects used for the demo are:
- [WebX Demo Server](https://github.com/ILLGrenoble/webx-demo-server) The WebX Demo Server is a simple Java backend integrating the WebX Relay. It can manage a multiuser environment using the full WebX stack, or simply connect to a single user, <em>standalone</em> WebX Engine.
- [WebX Demo Client](https://github.com/ILLGrenoble/webx-demo-client) The WebX Demo Client provides a simple web frontend packaged with the WebX Client library. The demo includes some useful debug features that help with the development and testing of WebX.
- [WebX Demo Deploy](https://github.com/ILLGrenoble/webx-demo-deploy) The WebX Demo Deploy project allows for a one line deployment of the demo application. The server and client are run in a docker compose stack along with an Nginx reverse proxy. This provides a very simple way of connecting to a running WebX Engine for testing purposes.

The following projects assist in the development of WebX:
- [WebX Dev Environment](https://github.com/ILLGrenoble/webx-dev-env) This provides a number of Docker environments that contain the necessary libraries and applications to build and run a WebX Engine in a container. Xorg and Xfce4 are both launched when the container is started. Mounting the WebX Engine source inside the container allows it to be built there too.
- [WebX Dev Workspace](https://github.com/ILLGrenoble/webx-dev-workspace) The WebX Dev Workspace regroups the WebX Engine, WebX Router and WebX Session Manager as git submodules and provides a devcontainer environment with the necessary build and runtime tools to develop and debug all three projects in a single docker environment. Combined with the WebX Demo Deploy project it provides an ideal way of developing and testing the full WebX remote desktop stack.

## Development

### Building the library

The WebX Client library is build using NPM:

```
npm run build
```

The build command can also be run to watch for source code changes and automatically rebuild the library when they occur:

```
npm run build:watch
```

### Development with the WebX Demo and WebX Dev Workspace

Development of the functionality of the client is most easily made with the [WebX Demo Client](https://github.com/ILLGrenoble/webx-demo-client) which integrates the WebX Client into a simple frontend. The [WebX Demo Server](https://github.com/ILLGrenoble/webx-demo-server) includes the WebX Relay and provides a websocket server for the WebX Client to connect to. The demo server and client together provide a simple means of connecting to a WebX host and thereby developing relay and client library functionality.

To have a fully functional WebX stack, the easiest way is to run the [WebX Dev Workspace](https://github.com/ILLGrenoble/webx-dev-workspace) either with a standalone WebX Engine or a multiuser WebX Router. Please see the README in this project for more details.

### Development of the WebX Client library within a WebX Demo Client

With the local sources of the WebX Demo Client, we can configure NPM to automatically link to the WebX Client library sources. Modifications to the library can be immediately integrated and tested into the demo.

In the WebX Client library project run the following command:

```
npm link
```

You can then build the library and watch for changes:

```
npm run build:watch
```

Clone the WebX Demo Client project (if not already done), install the libraries and link the webx-client library locally:

```
git clone https://github.com/ILLGrenoble/webx-demo-client
cd webx-demo-client

npm install

npm link @illgrenoble/webx-client
```

The WebX Demo Client can be run using the command:

```
npm start
```

The demo client is built and run. Changes that occur to the WebX Client library sources are automatically integrated into the demo application.

Assuming you have a WebX Demo Server running on the same machine, you can test the demo by opening `http://localhost:9000` in a browser. 

## NPM package integration

To add WebX Client to your application, the library is available on NPM and can be added to the `package.json` as follows:

```
  "dependencies": {
    ...
    "@illgrenoble/webx-client": "^0.1.1",
  }
```

## Design

The WebX Client is a javascript library used to render a WebX Engine Remote Desktop and send user events (mouse and keyboard) to it.

The rendering of the display requires WebGL.

### WebX Client

The `WebXClient` class provides the main interface to WebX providing:
 - connection and disconnection from a WebX Engine
 - forwarding mouse and keyboard events
 - setting the quality of the remote desktop 
 - debugging WebX events (instructions and messages to and from the server and data statistics)

The `WebXClient` contains:
 - `WebXDisplay` used to render the Remote Desktop
 - `WebXMouse` to manage the user's mouse events
 - `WebXKeyboard` to manage the user's keyboard events and convert the event data into usable information for the X11 server
 - `WebXTunnel` providing the transport mechanism to communicate with the WebX Relay
 - `WebXTextureFactory` to manage convert image data into textures
 - `WebXCursorFactory` to manage the different cursor objects of the X11 display

For initialisation, it requires a `WebXTunnel` object to handle communication with the WebX Engine and an `HTMLElement` to render the Remote Desktop. 

During initialisation, the `WebXClient` will:
 - attempt to connect to the WebX Engine and obtain the screen size
 - initialise the WebGL display element using `WebXDisplay` for the given screen size 
 - obtain a list of windows that are currently open
 - obtain images for all the windows
 - create the mouse and keyboard interfaces
 - display the screen

### WebX Tunnel

The `WebXTunnel` is an abstract class used to communicate with a backend server. It provides a callback on message reception and an abstract method to send instructions.

The `WebXWebSocketTunnel` provides a concrete implementations of the Tunnel for a standard websocket.

The Tunnel handles only binary data (`ArrayBuffer`) to and from the backend. A `WebXInstructionEncoder` and `WebXMessageDescoder` are used to encode instructions to the server and decode messages from the server respectively. 

#### Instructions and Requests

While all data sent to the server are considered as <em>instructions</em>, some that are sent produce responses: such instructions are called <em>requests</em>

The `WebXTunnel` method `sendRequest` returns a `Promise` that is called when the server sends a response that corresponds to the request (this is determine by an id sent in the instruction and returned in the message).

When a message with an instruction Id is received, the `WebXTunnel` determines if a request has been made for it. If found it will call the Promise's `resolve` function.

This is used for example to obtain the current list of open windows of the display, or to obtain image data for a window: specific code for each request can be called when the response is received asynchronously.

### WebX Display and Window

The `WebXDisplay` contains all the `WebXWindows` and a `WebXCursor`: it is used to render the state of the remote desktop.

The display is rendered with WebGL (using the three.js library). The `WebXDisplay` initialises the WebGL display and sets up the necessary three.js components (scene, camera, renderer, etc).

Each `WebXWindow` represents an X11 window in the Remote Desktop. It stored state information about the window (position and size) and three.js objects used to render it (mesh and material). Using the `WebXTextureFactory` it converts image data into WebGL textures. 

All image data is in JPEG format which does not contain transparency. To handle this a WebX Image can contain both a color and a grey-scale alpha image: both are converted to textures and the alpha texture is used as an alpha map in the three.js material. 

The `WebXCursor` represents the state of the cursor in the X11 display. It contains the position and cursor type. Each cursor type has a different image (or texture). When the cursor type changes the corresponding texture is re-used from the `WebXTextureFactory` or requested from the server if it is new.

### WebX Mouse

The `WebXMouse` maintains the state of the user's mouse and send instructions to the server when movement, button clicks or wheel events occur.

### WebX Keyboard

The WebX Keyboard uses almost identical logic to [Apache Guacamole Common Js](https://github.com/padarom/guacamole-common-js) key management: On a given key press, the key code is converted into a <em>keysym</em> that can be sent to the X11 server. 

A <em>keysym</em> is a unique identifier for a key (including modifier and function keys for example). This allows us to send keyboard events in a standard way to the WebX Engine. 

The WebX Engine converts the keysym value into a keyboard X11 event.

> Note that not all key events on the user's keyboard can be translated to the active keyboard on the X11 server. For example, accented characters typically do not have a keyboard equivalent for an US keyboard. In such cases the keyboard event produces no action on the Remote Desktop.

## Acknowledgements 

 * The keyboard management is derived from the [Apache Guacamole Common Js](https://github.com/padarom/guacamole-common-js) library
 * The [three.js](https://github.com/mrdoob/three.js/) library is used to simplify the WebGL rendering
