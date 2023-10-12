import { NotificareNotification } from '@notificare/web-core';
import { NotificareWorkerNotification } from './internal-types';

export function createPartialNotification(
  message: NotificareWorkerNotification,
): NotificareNotification {
  return {
    id: message.notificationId,
    partial: true,
    type: message.notificationType,
    time: new Date().toUTCString(),
    title: message.alertTitle,
    subtitle: message.alertSubtitle,
    message: message.alert ?? '',
    content: [],
    actions: [],
    attachments: message.attachment ? [message.attachment] : [],
    extra: {},
  };
}
