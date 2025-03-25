import { CloudDoNotDisturb } from '../models/do-not-disturb';

export interface CloudDeviceUpdatePayload {
  readonly userID?: string | null;
  readonly userName?: string | null;
  readonly language?: string;
  readonly region?: string;
  readonly platform?: string;
  readonly sdkVersion?: string;
  readonly appVersion?: string;
  readonly userAgent?: string;
  readonly timeZoneOffset?: number;
  readonly dnd?: CloudDoNotDisturb | null;
  readonly userData?: Record<string, string | null>;

  // Push attributes
  readonly transport?: string;
  readonly subscriptionId?: string;
  readonly keys?: object;
  readonly allowedUI?: boolean;
  readonly webPushCapable?: boolean;

  // Geo attributes
  readonly latitude?: number | null;
  readonly longitude?: number | null;
  readonly altitude?: number | null;
  readonly course?: number | null;
  readonly speed?: number | null;
  readonly locationAccuracy?: number | null;
  readonly country?: string | null;
  readonly locationServicesAuthStatus?: string | null;
  readonly locationServicesAccuracyAuth?: string | null;
}

export type CloudDeviceUpdateBaseAttributesPayload = CloudDeviceUpdatePayload &
  Required<
    Pick<
      CloudDeviceUpdatePayload,
      | 'language'
      | 'region'
      | 'platform'
      | 'sdkVersion'
      | 'appVersion'
      | 'userAgent'
      | 'timeZoneOffset'
    >
  >;
