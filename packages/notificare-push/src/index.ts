import { registerComponents } from './register-components';

declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Window {
    safari?: {
      pushNotification?: unknown;
    };
  }
}

export * from './public-api';

registerComponents();
