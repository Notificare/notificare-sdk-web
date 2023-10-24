import { NotificareNotification, NotificareNotificationAction } from '@notificare/web-core';
import { createCloudNotificationReply, fetchCloudNotification } from '@notificare/web-cloud-api';
import { logger } from '../../logger';
import { parseWorkerConfiguration } from '../configuration/parser';
import { ensureOpenWindowClient } from '../ui/window-client';
import { presentNotification } from '../ui/notifications';
import { presentNotificationAction } from '../ui/notification-actions';
import { getCloudApiEnvironment } from '../cloud-api/environment';
import { getCurrentPushToken } from '../utils';
import { convertCloudNotificationToPublic } from '../cloud-api/converters/notification-converter';
import { logNotificationInfluenced, logNotificationOpen } from '../cloud-api/requests/events';

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
    const response = await fetchCloudNotification({
      environment: await getCloudApiEnvironment(),
      id: event.notification.data.id,
    });

    notification = convertCloudNotificationToPublic(response.notification);

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
    await createNotificationReply(notification, action);
    return;
  }

  await presentNotificationAction(notification, action);
  await createNotificationReply(notification, action);
}

async function createNotificationReply(
  notification: NotificareNotification,
  action: NotificareNotificationAction,
) {
  const deviceId = await getCurrentPushToken();
  if (!deviceId) throw new Error('Unable to acquire the device id.');

  await createCloudNotificationReply({
    environment: await getCloudApiEnvironment(),
    payload: {
      notification: notification.id,
      label: action.label,
      deviceID: deviceId,
      data: {
        target: action.target,
      },
    },
  });
}
