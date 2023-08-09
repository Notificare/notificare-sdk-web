import { NotificareNotificationAttachment } from '@notificare/web-core';
import { NotificareInboxItem } from '../../../models/notificare-inbox-item';

export interface NetworkInboxResponse {
  readonly inboxItems: NetworkInboxItem[];
  readonly count: number;
  readonly unread: number;
}

export interface NetworkInboxItem {
  readonly _id: string;
  readonly notification: string;
  readonly type: string;
  readonly time: string;
  readonly title?: string;
  readonly subtitle?: string;
  readonly message: string;
  readonly attachment?: NetworkInboxItemAttachment;
  readonly extra?: Record<string, unknown>;
  readonly opened?: boolean;
  readonly visible?: boolean;
  readonly expires?: string;
}

export interface NetworkInboxItemAttachment {
  readonly mimeType: string;
  readonly uri: string;
}

export function convertNetworkInboxItemToPublic(inboxItem: NetworkInboxItem): NotificareInboxItem {
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
  attachment: NetworkInboxItemAttachment,
): NotificareNotificationAttachment {
  return {
    mimeType: attachment.mimeType,
    uri: attachment.uri,
  };
}
