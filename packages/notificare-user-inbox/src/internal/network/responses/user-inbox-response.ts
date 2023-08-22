import { NotificareNotificationAttachment } from '@notificare/web-core';
import { NotificareUserInboxItem } from '../../../models/notificare-user-inbox-item';

export interface NetworkUserInboxResponse {
  readonly inboxItems: NetworkUserInboxItem[];
  readonly count: number;
  readonly unread: number;
}

export interface NetworkUserInboxItem {
  readonly _id: string;
  readonly notification: string;
  readonly type: string;
  readonly time: string;
  readonly title?: string;
  readonly subtitle?: string;
  readonly message: string;
  readonly attachment?: NetworkUserInboxItemAttachment;
  readonly extra?: Record<string, unknown>;
  readonly opened?: boolean;
  readonly visible?: boolean;
  readonly expires?: string;
}

export interface NetworkUserInboxItemAttachment {
  readonly mimeType: string;
  readonly uri: string;
}

export function convertNetworkUserInboxItemToPublic(
  inboxItem: NetworkUserInboxItem,
): NotificareUserInboxItem {
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
  attachment: NetworkUserInboxItemAttachment,
): NotificareNotificationAttachment {
  return {
    mimeType: attachment.mimeType,
    uri: attachment.uri,
  };
}
