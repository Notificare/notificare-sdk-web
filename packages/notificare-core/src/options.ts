export interface NotificareOptions {
  applicationKey: string;
  applicationSecret: string;
  applicationVersion?: string;
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

// {
//   "ignoreNonWebPushDevices": false, /* Set to true to prevent registering non-webpush devices */
//   "allowOnlyWebPushSupportedDevices": false,
// }
