import { CloudInboxItem } from '../models/inbox';

export interface CloudInboxResponse {
  readonly items: CloudInboxItem[];
  readonly count: number;
  readonly unread: number;
}
