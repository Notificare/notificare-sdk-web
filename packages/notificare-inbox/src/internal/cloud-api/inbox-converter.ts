import { NotificareNotificationAttachment } from '@notificare/web-core';
import { CloudDeviceInboxItem, CloudDeviceInboxItemAttachment } from '@notificare/web-cloud-api';
import { NotificareInboxItem } from '../../models/notificare-inbox-item';

export function convertCloudInboxItemToPublic(
  inboxItem: CloudDeviceInboxItem,
): NotificareInboxItem {
  return {
    // eslint-disable-next-line no-underscore-dangle
    id: inboxItem._id,
    time: inboxItem.time,
    opened: inboxItem.opened ?? false,
    expires: inboxItem.expires,
    notification: {
      id: inboxItem.notification,
      partial: true,
      type: inboxItem.type,
      time: inboxItem.time,
      title: inboxItem.title,
      subtitle: inboxItem.subtitle,
      message: inboxItem.message,
      content: [],
      actions: [],
      attachments: inboxItem.attachment
        ? [convertNetworkInboxItemAttachmentToPublic(inboxItem.attachment)]
        : [],
      extra: inboxItem.extra ?? {},
    },
  };
}

function convertNetworkInboxItemAttachmentToPublic(
  attachment: CloudDeviceInboxItemAttachment,
): NotificareNotificationAttachment {
  return {
    mimeType: attachment.mimeType,
    uri: attachment.uri,
  };
}
