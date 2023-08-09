import { NotificareNotification } from '@notificare/web-core';

export interface NotificareUserInboxItem {
  readonly id: string;
  readonly notification: NotificareNotification;
  readonly time: string;
  readonly opened: boolean;
  readonly expires?: string;
}
