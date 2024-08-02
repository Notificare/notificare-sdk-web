export interface CloudCreateDevicePayload {
  readonly language: string;
  readonly region: string;
  readonly platform: string;
  readonly sdkVersion: string;
  readonly appVersion: string;
  readonly userAgent: string;
  readonly timeZoneOffset: number;
}

export interface CloudUpgradeToLongLivedDevicePayload {
  readonly deviceID: string;
  readonly transport: string;
  readonly subscriptionId?: string;
  readonly keys?: object;
  readonly language: string;
  readonly region: string;
  readonly platform: string;
  readonly sdkVersion: string;
  readonly appVersion: string;
  readonly userAgent: string;
  readonly timeZoneOffset: number;
}
