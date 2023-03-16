import { serviceWorkerLogger } from './logger';
import { onMessage, onNotificationClick, onPush } from './internal/sw-handlers';

declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Navigator {
    setAppBadge?: (badge: number) => void;
    setClientBadge?: (badge: number) => void;
  }
}

// Let TS know this is scoped to a service worker.
declare const self: ServiceWorkerGlobalScope;

self.addEventListener('install', (event) => {
  serviceWorkerLogger.debug('Service worker installed.');
  event.waitUntil(self.skipWaiting()); // Activate worker immediately.

  // NOTE: without this install + activate setup, the service worker controller
  // will not be available on the website to send post messages to the worker.
});

self.addEventListener('activate', (event) => {
  serviceWorkerLogger.debug('Service worker activated.');
  event.waitUntil(self.clients.claim()); // Become available to all pages.

  // NOTE: without this install + activate setup, the service worker controller
  // will not be available on the website to send post messages to the worker.
});

self.addEventListener('message', (event) => {
  serviceWorkerLogger.debug('Handling a service worker message event.');
  onMessage(event);
});

self.addEventListener('push', (event) => {
  serviceWorkerLogger.debug('Handling a push notification event.');
  event.waitUntil(onPush(event));
});

self.addEventListener('pushsubscriptionchange', () => {
  serviceWorkerLogger.debug('Handling a push subscription change event.');
});

self.addEventListener('notificationclick', (event) => {
  serviceWorkerLogger.debug('Handling a notification click event.');
  event.waitUntil(onNotificationClick(event));
});

// We need an export to force this file to act like a module, so TS will let us re-type `self`.
export default null;
