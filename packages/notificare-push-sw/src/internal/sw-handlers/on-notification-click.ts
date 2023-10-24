import {
  fetchCloudApplication,
  fetchCloudDeviceInbox,
  fetchCloudNotification,
} from '@notificare/web-cloud-api';
import { logger } from '../../logger';
import { parseWorkerConfiguration } from '../configuration/parser';
import { ensureOpenWindowClient } from '../ui/window-client';
import { presentNotification } from '../ui/notifications';
import { createNotificationReply, presentNotificationAction } from '../ui/notification-actions';
import { getCloudApiEnvironment } from '../cloud-api/environment';
import { getCurrentPushToken } from '../utils';
import { convertCloudNotificationToPublic } from '../cloud-api/converters/notification-converter';
import { logNotificationInfluenced, logNotificationOpen } from '../cloud-api/requests/events';

// Let TS know this is scoped to a service worker.
declare const self: ServiceWorkerGlobalScope;

export async function onNotificationClick(event: NotificationEvent) {
  event.notification.close();

  const workerConfiguration = parseWorkerConfiguration();

  if (workerConfiguration) {
    await handleStandardClick(event);
  } else {
    await handleLegacyClick(event);
  }
}

async function handleLegacyClick(event: NotificationEvent) {
  const client = await ensureOpenWindowClient();

  client.postMessage({
    cmd: event.action
      ? 're.notifica.push.sw.notification_reply'
      : 're.notifica.push.sw.notification_clicked',
    notification: event.notification.data,
    action: event.action,
  });

  try {
    await client.focus();
  } catch (e) {
    logger.error('Failed to focus client: ', client, e);
  }
}

async function handleStandardClick(event: NotificationEvent) {
  await logNotificationOpen(event.notification.data.notificationId);
  await logNotificationInfluenced(event.notification.data.notificationId);
  await broadcastInboxUpdate();

  const response = await fetchCloudNotification({
    environment: await getCloudApiEnvironment(),
    id: event.notification.data.id,
  });

  const notification = convertCloudNotificationToPublic(response.notification);

  if (!event.action) {
    await presentNotification(notification);
    await refreshApplicationBadge();
    return;
  }

  const action = notification.actions.find((element) => element.id === event.action);
  if (!action) throw new Error('Cannot find the action clicked to process the event.');

  const isQuickResponse =
    action.type === 're.notifica.action.Callback' && !action.camera && !action.keyboard;

  if (isQuickResponse) {
    await createNotificationReply(notification, action);
    await refreshApplicationBadge();
    return;
  }

  await presentNotificationAction(notification, action);
  await refreshApplicationBadge();
}

async function refreshApplicationBadge() {
  logger.debug('Updating application badge.');

  if (!navigator.setAppBadge && !navigator.setClientBadge) {
    logger.debug('There is no badge support. Skipping badge update.');
    return;
  }

  try {
    const { application } = await fetchCloudApplication({
      environment: await getCloudApiEnvironment(),
    });

    if (!application.inboxConfig?.autoBadge) {
      logger.debug('Auto badge functionality disabled. Skipping badge update.');
      return;
    }

    const deviceId = await getCurrentPushToken();
    if (!deviceId) {
      logger.warning('Unable to acquire the device id.');
      return;
    }

    const { unread } = await fetchCloudDeviceInbox({
      environment: await getCloudApiEnvironment(),
      deviceId,
      skip: 0,
      limit: 0,
    });

    if (navigator.setAppBadge) await navigator.setAppBadge(unread);
    if (navigator.setClientBadge) navigator.setClientBadge(unread);
  } catch (e) {
    logger.warning('Failed to update the application badge.', e);
  }
}

async function broadcastInboxUpdate() {
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({
      cmd: 're.notifica.push.sw.update_inbox',
    });
  });
}
