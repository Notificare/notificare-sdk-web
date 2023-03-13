import { NotificareInboxItem } from './notificare-inbox-item';

export interface NotificareInboxResponse {
  readonly items: NotificareInboxItem[];
  readonly count: number;
  readonly unread: number;
}
