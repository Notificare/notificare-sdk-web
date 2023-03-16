import { registerComponents } from './register-components';

declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Window {
    safari?: {
      pushNotification?: unknown;
    };
  }

  // noinspection JSUnusedGlobalSymbols
  interface Navigator {
    standalone?: boolean;
  }
}

export * from './public-api';

registerComponents();
