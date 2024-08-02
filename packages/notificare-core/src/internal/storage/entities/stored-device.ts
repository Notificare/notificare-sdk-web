import { NotificareDoNotDisturb } from '../../../models/notificare-do-not-disturb';

export interface StoredDevice {
  readonly id: string;
  readonly userId?: string;
  readonly userName?: string;
  readonly timeZoneOffset: number;
  readonly sdkVersion: string;
  readonly appVersion: string;
  readonly userAgent: string;
  readonly language: string;
  readonly region: string;
  readonly transport?: string | null;
  readonly dnd?: NotificareDoNotDisturb;
  readonly userData: Record<string, string>;
}
