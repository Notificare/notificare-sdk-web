import { NotificareDoNotDisturb } from './notificare-do-not-disturb';
import { NotificareTransport } from './notificare-transport';

export interface NotificareDevice {
  readonly id: string;
  readonly userId?: string;
  readonly userName?: string;
  readonly timeZoneOffset: number;
  readonly sdkVersion: string;
  readonly appVersion: string;
  readonly language: string;
  readonly region: string;
  readonly transport: NotificareTransport;
  readonly dnd?: NotificareDoNotDisturb;
  readonly userData: Record<string, string>;
  readonly lastRegistered: string;
}
