import { fetchNotification, logNotificationOpen } from '@notificare/core';
import { logNotificationInfluenced } from './internal-api-events';
import { notifyNotificationOpened } from './consumer-events';

export async function handleNotificationOpened(notificationId: string) {
  // Log the notification open event.
  await logNotificationOpen(notificationId);
  await logNotificationInfluenced(notificationId);

  // Notify the inbox to mark the item as read.
  // TODO: InboxIntegration.markItemAsRead(message)

  const notification = await fetchNotification(notificationId);
  notifyNotificationOpened(notification);
}
