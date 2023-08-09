import {
  broadcastComponentEvent,
  fetchNotification,
  logNotificationOpen,
} from '@notificare/web-core';
import { logNotificationInfluenced } from './internal-api-events';
import { notifyNotificationOpened } from './consumer-events';

export async function handleNotificationOpened(notificationId: string) {
  // Log the notification open event.
  await logNotificationOpen(notificationId);
  await logNotificationInfluenced(notificationId);

  // Notify the inbox to mark the item as read.
  broadcastComponentEvent('notification_opened');

  const notification = await fetchNotification(notificationId);
  notifyNotificationOpened(notification);
}
