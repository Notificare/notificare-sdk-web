import { fetchCloudNotification } from '@notificare/web-cloud-api';
import { NotificareNotification } from '@notificare/web-core';
import { logger } from '../../logger';
import { convertCloudNotificationToPublic } from '../cloud-api/converters/notification-converter';
import { getCloudApiEnvironment } from '../cloud-api/environment';
import { logNotificationReceived } from '../cloud-api/requests/events';
import { parseWorkerConfiguration } from '../configuration/parser';
import { createPartialNotification } from '../create-partial-notification';
import { NotificareWorkerNotification, WorkerNotification } from '../internal-types';

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

  const clients = await self.clients.matchAll();
  if (!clients.length) return;

  let notification: NotificareNotification;

  try {
    const response = await fetchCloudNotification({
      environment: await getCloudApiEnvironment(),
      id: workerNotification.id,
    });

    notification = convertCloudNotificationToPublic(response.notification);
  } catch (e) {
    logger.error('Failed to fetch notification.', e);
    notification = createPartialNotification(workerNotification);
  }

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
  let icon: string | undefined;

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
