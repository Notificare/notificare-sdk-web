export interface NotificareOptions {
  applicationKey: string;
  applicationSecret: string;
  applicationVersion?: string;
  language?: string;
  serviceWorker: string;
  serviceWorkerScope?: string;
}

// {
//   "ignoreNonWebPushDevices": false, /* Set to true to prevent registering non-webpush devices */
//   "allowOnlyWebPushSupportedDevices": false,
//   "googleMapsAPIKey": "PUT_GMAPS_KEY_HERE",
//   "geolocationOptions": {
//   "timeout": 60000,
//     "enableHighAccuracy": true,
//     "maximumAge": 100000
// }
