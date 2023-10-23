import { CloudDeviceInboxItem } from '../models/device-inbox';

export interface CloudDeviceInboxResponse {
  readonly inboxItems: CloudDeviceInboxItem[];
  readonly count: number;
  readonly unread: number;
}
