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

export function hasWebPushCapabilities(): boolean {
  const safariPushSupported = window.safari?.pushNotification != null;
  const webPushSupported = navigator.serviceWorker != null && window.PushManager != null;
  // ServiceWorkerRegistration.prototype.showNotification;

  return safariPushSupported || webPushSupported;
}

function registerComponents() {
  registerComponent(new PushComponent());
}

registerComponents();
