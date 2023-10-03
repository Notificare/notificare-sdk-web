export interface ConfigurationFormState {
  debugLoggingEnabled: boolean;
  applicationVersion: string;
  language: string;
  ignoreTemporaryDevices: boolean;
  ignoreUnsupportedWebPushDevices: boolean;
  serviceWorkerLocation: string;
  serviceWorkerScope: string;
  geolocationHighAccuracyEnabled: boolean;
  geolocationMaximumAge: string;
  geolocationTimeout: string;
}
