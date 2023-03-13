import { NotificareUserInboxItem } from './notificare-user-inbox-item';

export interface NotificareUserInboxResponse {
  readonly items: NotificareUserInboxItem[];
  readonly count: number;
  readonly unread: number;
}
