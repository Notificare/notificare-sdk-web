import { NotificareNotification } from '@notificare/web-core';
import { logger } from '../../logger';
import { NotificareWorkerNotification, WorkerNotification } from '../internal-types';
import { fetchNotification, logNotificationReceived } from '../network/cloud-api';
import { parseWorkerConfiguration } from '../configuration/parser';
import { createPartialNotification } from '../create-partial-notification';

// Let TS know this is scoped to a service worker.
declare const self: ServiceWorkerGlobalScope;

export async function onPush(event: PushEvent) {
  if (!event.data) {
    logger.warning('The push event contained no data. Skipping...');
    return;
  }

  let workerNotification: WorkerNotification;

  try {
    workerNotification = event.data.json();
  } catch (e) {
    logger.error('Unable to parse the push event data.');
    return;
  }

  if (workerNotification['x-sender'] !== 'notificare') {
    await handleUnknownNotification(workerNotification);
    return;
  }

  const notification: NotificareWorkerNotification = workerNotification;

  if (notification.system) {
    await handleSystemNotification(notification);
    return;
  }

  await handleNotification(notification);
}

async function handleUnknownNotification(workerNotification: WorkerNotification) {
  logger.debug('Processing an unknown notification.');

  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({
      cmd: 're.notifica.push.sw.unknown_notification_received',
      message: workerNotification,
    });
  });
}

async function handleSystemNotification(workerNotification: NotificareWorkerNotification) {
  logger.debug('Processing a system notification.', workerNotification);

  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({
      cmd: 're.notifica.push.sw.system_notification_received',
      message: workerNotification,
    });
  });
}

async function handleNotification(workerNotification: NotificareWorkerNotification) {
  const workerConfiguration = parseWorkerConfiguration();

  if (!workerConfiguration) {
    logger.debug('Service worker has no configuration. Falling back to legacy behaviour.');
    await updateApplicationBadge(workerNotification);
    await showNotificationPreview(workerNotification);

    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        cmd: 're.notifica.push.sw.notification_received',
        message: workerNotification,
      });
    });

    return;
  }

  await logNotificationReceived(workerNotification.notificationId);
  await updateApplicationBadge(workerNotification);
  await showNotificationPreview(workerNotification);

  let notification: NotificareNotification;

  try {
    notification = await fetchNotification(workerNotification.id);
  } catch (e) {
    logger.error('Failed to fetch notification.', e);
    notification = createPartialNotification(workerNotification);
  }

  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({
      cmd: 're.notifica.push.sw.notification_received',
      content: {
        message: workerNotification,
        notification,
      },
    });
  });
}

async function updateApplicationBadge(notification: NotificareWorkerNotification) {
  try {
    const { badge } = notification;
    if (!badge) return;

    if (navigator.setAppBadge) await navigator.setAppBadge(badge);
    if (navigator.setClientBadge) navigator.setClientBadge(badge);
  } catch (e) {
    logger.warning('Unable to update the application badge.', e);
  }
}

async function showNotificationPreview(notification: NotificareWorkerNotification) {
  if (!notification.push || !notification.alert) {
    // Silent notification.
    return;
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
