import { NotificareNotification, NotificareNotificationAction } from '@notificare/web-core';
import { logger } from '../../logger';
import { parseWorkerConfiguration } from '../configuration/parser';
import {
  createNotificationReply,
  fetchNotification,
  logNotificationInfluenced,
  logNotificationOpen,
} from '../network/cloud-api';
import { ensureOpenWindowClient } from '../ui/window-client';
import { presentNotification } from '../ui/notifications';
import { presentNotificationAction } from '../ui/notification-actions';

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

  let notification: NotificareNotification;
  let action: NotificareNotificationAction | undefined;

  try {
    notification = await fetchNotification(event.notification.data.id);

    if (event.action) {
      action = notification.actions.find((element) => element.id === event.action);

      if (!action) {
        logger.warning('Cannot find the action clicked to process the event.');
        return;
      }
    }
  } catch (e) {
    logger.error('Failed to fetch notification.', e);
    return;
  }

  if (!action) {
    await presentNotification(notification);
    return;
  }

  const isQuickResponse =
    action.type === 're.notifica.action.Callback' && !action.camera && !action.keyboard;

  if (isQuickResponse) {
    await createNotificationReply({ notification, action });
    return;
  }

  await presentNotificationAction(notification, action);
  await createNotificationReply({ notification, action });
}
