export interface CloudDeviceUpdatePayload {
  language?: string;
  region?: string;
  allowedUI?: boolean;
  webPushCapable?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  altitude?: number | null;
  course?: number | null;
  speed?: number | null;
  locationAccuracy?: number | null;
  country?: string | null;
  locationServicesAuthStatus?: string | null;
  locationServicesAccuracyAuth?: string | null;
}
