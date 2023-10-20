import { CloudDeviceInboxItem } from '../models/device-inbox';

export interface CloudDeviceInboxResponse {
  readonly items: CloudDeviceInboxItem[];
  readonly count: number;
  readonly unread: number;
}
