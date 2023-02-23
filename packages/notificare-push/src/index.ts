import { registerComponent } from '@notificare/core';
import { PushComponent } from './component';

declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Window {
    safari?: {
      pushNotification?: unknown;
    };
  }
}

export * from './public-api';

function registerComponents() {
  registerComponent(new PushComponent());
}

registerComponents();
