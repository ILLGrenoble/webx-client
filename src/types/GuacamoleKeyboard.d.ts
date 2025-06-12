declare namespace Guacamole {
  class Keyboard {
    constructor(element: HTMLElement | Document);
    onkeydown: (key: number) => void;
    onkeyup: (key: number) => void;
    reset(): void;
    dispose(): void;
  }
}
