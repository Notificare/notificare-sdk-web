import { NotificareLaunchMode } from '../options';

// eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle
let _options: NotificareInternalOptions | undefined;

export function getOptions(): NotificareInternalOptions | undefined {
  return _options;
}

export function setOptions(options: NotificareInternalOptions) {
  _options = options;
}

export interface NotificareInternalOptions {
  services: NotificareInternalOptionsServices;
  applicationKey: string;
  applicationSecret: string;
  applicationHost: string;
  applicationVersion: string;
  mode: NotificareLaunchMode;
  serviceWorker?: string;
  serviceWorkerScope?: string;
}

export interface NotificareInternalOptionsServices {
  cloudHost: string;
  pushHost: string;
}
