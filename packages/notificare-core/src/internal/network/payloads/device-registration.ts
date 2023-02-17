import { NotificareTransport } from '../../../models/notificare-transport';

export interface DeviceRegistration {
  readonly deviceID: string;
  readonly oldDeviceID?: string;
  readonly userID?: string;
  readonly userName?: string;
  readonly language: string;
  readonly region: string;
  readonly platform: string;
  readonly transport: NotificareTransport;
  readonly sdkVersion: string;
  readonly appVersion: string;
  readonly userAgent: string;
  readonly timeZoneOffset: number;
  readonly allowedUI?: boolean;
}
