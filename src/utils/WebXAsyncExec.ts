export class WebXAsyncExec {

  constructor(private _func: (...args: any[]) => void) {
  }

  public exec(...args: any[]): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this._func(...args);

        resolve();
      }, 0);
    });
  }
}
