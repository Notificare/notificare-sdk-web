// eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle
let _options: NotificareInternalOptions | undefined;

export const DEFAULT_CLOUD_API_HOST = 'cloud.notifica.re';
export const DEFAULT_REST_API_HOST = 'push.notifica.re';

export function getOptions(): NotificareInternalOptions | undefined {
  return _options;
}

export function setOptions(options: NotificareInternalOptions) {
  _options = options;
}

export function isDefaultHosts(hosts: NotificareInternalOptionsHosts): boolean {
  return hosts.cloudApi === DEFAULT_CLOUD_API_HOST && hosts.restApi === DEFAULT_REST_API_HOST;
}

export interface NotificareInternalOptions {
  hosts: NotificareInternalOptionsHosts;
  applicationKey: string;
  applicationSecret: string;
  applicationHost: string;
  applicationVersion: string;
  ignoreTemporaryDevices?: boolean;
  ignoreUnsupportedWebPushDevices?: boolean;
  language?: string;
  serviceWorker?: string;
  serviceWorkerScope?: string;
  geolocation?: NotificareInternalOptionsGeolocation;
}

export interface NotificareInternalOptionsHosts {
  cloudApi: string;
  restApi: string;
}

export interface NotificareInternalOptionsGeolocation {
  timeout?: number;
  enableHighAccuracy?: boolean;
  maximumAge?: number;
}
