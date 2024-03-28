import { onMessage, onNotificationClick, onPush } from './internal/sw-handlers';
import { logger } from './logger';

// Let TS know this is scoped to a service worker.
declare const self: ServiceWorkerGlobalScope;

self.addEventListener('install', (event) => {
  logger.debug('Service worker installed.');
  event.waitUntil(self.skipWaiting()); // Activate worker immediately.

  // NOTE: without this install + activate setup, the service worker controller
  // will not be available on the website to send post messages to the worker.
});

self.addEventListener('activate', (event) => {
  logger.debug('Service worker activated.');
  event.waitUntil(self.clients.claim()); // Become available to all pages.

  // NOTE: without this install + activate setup, the service worker controller
  // will not be available on the website to send post messages to the worker.
});

self.addEventListener('message', (event) => {
  logger.debug('Handling a service worker message event.');
  onMessage(event);
});

self.addEventListener('push', (event) => {
  logger.debug('Handling a push notification event.');
  event.waitUntil(onPush(event));
});

self.addEventListener('pushsubscriptionchange', () => {
  logger.info('Handling a push subscription change event.');
});

self.addEventListener('notificationclick', (event) => {
  logger.debug('Handling a notification click event.');
  event.waitUntil(onNotificationClick(event));
});

// We need an export to force this file to act like a module, so TS will let us re-type `self`.
export default null;
