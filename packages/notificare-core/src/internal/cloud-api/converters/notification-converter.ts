import {
  CloudNotification,
  CloudNotificationAction,
  CloudNotificationAttachment,
  CloudNotificationContent,
} from '@notificare/web-cloud-api';
import {
  NotificareNotification,
  NotificareNotificationAction,
  NotificareNotificationAttachment,
  NotificareNotificationContent,
} from '../../../models/notificare-notification';

export function convertCloudNotificationToPublic(
  notification: CloudNotification,
): NotificareNotification {
  return {
    // eslint-disable-next-line no-underscore-dangle
    id: notification._id,
    partial: notification.partial ?? false,
    type: notification.type,
    time: notification.time,
    title: notification.title,
    subtitle: notification.subtitle,
    message: notification.message,
    content: notification.content?.map(convertNotificationContentToPublic) ?? [],
    actions: (notification.actions ?? []).reduce((acc, currentValue) => {
      const action = convertNotificationActionToPublic(currentValue);
      if (action) acc.push(action);

      return acc;
    }, [] as NotificareNotificationAction[]),
    attachments: notification.attachments?.map(convertNotificationAttachmentToPublic) ?? [],
    extra: notification.extra ?? {},
  };
}

function convertNotificationContentToPublic(
  content: CloudNotificationContent,
): NotificareNotificationContent {
  return {
    type: content.type,
    data: content.data,
  };
}

function convertNotificationActionToPublic(
  action: CloudNotificationAction,
): NotificareNotificationAction | undefined {
  if (!action.label) return undefined;

  return {
    type: action.type,
    label: action.label,
    target: action.target,
    camera: action.camera ?? false,
    keyboard: action.keyboard ?? false,
  };
}

function convertNotificationAttachmentToPublic(
  attachment: CloudNotificationAttachment,
): NotificareNotificationAttachment {
  return {
    mimeType: attachment.mimeType,
    uri: attachment.uri,
  };
}
