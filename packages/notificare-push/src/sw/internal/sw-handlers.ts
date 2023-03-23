import { serviceWorkerLogger } from '../logger';
import { NotificareWorkerNotification, WorkerNotification } from './internal-types';
import { sleep } from '../../internal/utils';

// Let TS know this is scoped to a service worker.
declare const self: ServiceWorkerGlobalScope;

let hasReadyClients = false;

export function onMessage(event: ExtendableMessageEvent) {
  if (!event.data) return;

  try {
    switch (event.data.action) {
      case 're.notifica.ready':
        hasReadyClients = true;
        break;
      default:
        serviceWorkerLogger.warning('Unknown service worker message event: ', event);
    }
  } catch (e) {
    serviceWorkerLogger.error('Failed to process a service worker message event: ', e);
  }
}

export async function onPush(event: PushEvent) {
  if (!event.data) {
    serviceWorkerLogger.warning('The push event contained no data. Skipping...');
    return;
  }

  let workerNotification: WorkerNotification;

  try {
    workerNotification = event.data.json();
  } catch (e) {
    serviceWorkerLogger.error('Unable to parse the push event data.');
    // TODO: Consider preserving the v2 'workerpush' post message.
    return;
  }

  serviceWorkerLogger.info(workerNotification);

  if (workerNotification['x-sender'] !== 'notificare') {
    serviceWorkerLogger.debug('Processing an unknown notification.');
    // TODO: consider sending the event to the worker instead.

    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        cmd: 'unknownpush',
        message: workerNotification,
      });
    });

    return;
  }

  const notification: NotificareWorkerNotification = workerNotification;

  if (notification.system) {
    serviceWorkerLogger.debug('Processing a system notification.', notification);
    // TODO: consider sending the event to the worker instead.

    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        cmd: 'system',
        message: workerNotification,
      });
    });

    return;
  }

  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({
      cmd: 'notificationreceive',
      message: workerNotification,
    });
  });

  if (!notification.push || !notification.alert) {
    // Silent notification.
    return;
  }

  const { badge } = notification;
  if (badge) {
    if (navigator.setAppBadge) navigator.setAppBadge(badge);
    if (navigator.setClientBadge) navigator.setClientBadge(badge);
  }

  const title = notification.alertTitle ?? notification.application ?? '';
  let { icon } = notification;

  // When the browser doesn't support the image attribute, use the attachment as the icon when available.
  if (!('image' in Notification.prototype) && notification.attachment?.uri) {
    icon = notification.attachment.uri;
  }

  const options: NotificationOptions = {
    tag: notification.id,
    body: notification.alert,
    icon,
    image: notification.attachment?.uri,
    requireInteraction: notification.requireInteraction,
    renotify: notification.renotify,
    actions: notification.actions?.map((action) => ({
      // eslint-disable-next-line no-underscore-dangle
      action: action._id,
      title: action.label,
      icon: action.icon,
    })),
    data: notification,
  };

  await self.registration.showNotification(title, options);
}

export async function onNotificationClick(event: NotificationEvent) {
  event.notification.close();

  await ensureOpenWindowClient();

  const clients = await self.clients.matchAll({ type: 'window' });
  if (!clients.length) {
    serviceWorkerLogger.error('Unable to process the notification click without an active client.');
    throw new Error('Unable to process the notification click without an active client.');
  }

  const client = clients[0];

  if (event.action) {
    client.postMessage({
      cmd: 'notificationreply',
      notification: event.notification.data,
      action: event.action,
    });
  } else {
    client.postMessage({
      cmd: 'notificationclick',
      notification: event.notification.data,
    });
  }

  try {
    await client.focus();
  } catch (e) {
    serviceWorkerLogger.error('Failed to focus client: ', client, e);
  }
}

async function ensureOpenWindowClient() {
  const clients = await self.clients.matchAll({ type: 'window' });
  if (clients.length) {
    if (hasReadyClients) return;

    await waitForOpenWindowClient();
    return;
  }

  // Reset the readiness state in case the service worker instance is reused across
  // application restarts, when it used to be ready.
  hasReadyClients = false;

  // const url = event.notification.data.urlFormatString.replace("%@", event.notification.tag);
  await self.clients.openWindow('/');
  await waitForOpenWindowClient();
}

async function waitForOpenWindowClient() {
  const clients = await self.clients.matchAll({ type: 'window' });
  if (clients.length && hasReadyClients) return;

  await sleep(1000);
  await waitForOpenWindowClient();
}