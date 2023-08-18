export interface NotificareOptions {
  applicationKey: string;
  applicationSecret: string;
  applicationVersion?: string;
  ignoreUnsupportedWebPushDevices?: boolean;
  language?: string;
  serviceWorker?: string;
  serviceWorkerScope?: string;
  geolocation?: NotificareGeolocationOptions;
}

export interface NotificareGeolocationOptions {
  timeout?: number;
  enableHighAccuracy?: boolean;
  maximumAge?: number;
}
