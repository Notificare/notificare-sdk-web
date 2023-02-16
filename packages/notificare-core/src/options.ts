export interface NotificareOptions {
  applicationKey: string;
  applicationSecret: string;
  applicationVersion?: string;
  mode?: NotificareLaunchMode;
}

export type NotificareLaunchMode = 'floating-button' | 'auto-on-boarding' | 'manual';

// {
//   "appHost": "http://localhost:3000",
//   "appVersion": "1.0",
//   "appKey": "PUT_APP_KEY_HERE",
//   "appSecret": "PUT_APP_SECRET_HERE",
//   "ignoreNonWebPushDevices": false, /* Set to true to prevent registering non-webpush devices */
//   "allowOnlyWebPushSupportedDevices": false,
//   "serviceWorker": "sw.js",
//   "serviceWorkerScope": "./", /* Leave this option out if you don't want a scope */
//   "googleMapsAPIKey": "PUT_GMAPS_KEY_HERE",
//   "geolocationOptions": {
//   "timeout": 60000,
//     "enableHighAccuracy": true,
//     "maximumAge": 100000
// }
