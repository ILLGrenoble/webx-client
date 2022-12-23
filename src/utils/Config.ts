export interface Config {
  showWindowsBeforeImage: boolean;
}

export function APP_CONFIG(): Config {
  return {
    showWindowsBeforeImage: false
  };
}
