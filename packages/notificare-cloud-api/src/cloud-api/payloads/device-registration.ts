export interface CloudDeviceRegistrationPayload {
  readonly deviceID: string;
  readonly oldDeviceID?: string;
  readonly userID?: string;
  readonly userName?: string;
  readonly language: string;
  readonly region: string;
  readonly platform: string;
  readonly transport: string;
  readonly keys?: object;
  readonly sdkVersion: string;
  readonly appVersion: string;
  readonly userAgent: string;
  readonly timeZoneOffset: number;
  readonly allowedUI?: boolean;
}
