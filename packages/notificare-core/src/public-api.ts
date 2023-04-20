import { LogLevel } from '@notificare/logger';
import { request } from './internal/network/request';
import {
  convertNetworkApplicationToPublic,
  NetworkApplicationResponse,
} from './internal/network/responses/application-response';
import { NotificareOptions } from './options';
import { logger } from './internal/logger';
import { getOptions, NotificareInternalOptionsServices, setOptions } from './internal/options';
import { LaunchState } from './internal/launch-state';
import { NotificareApplication } from './models/notificare-application';
import { NotificareNotConfiguredError } from './errors/notificare-not-configured-error';
import { components } from './internal/component-cache';
import { EventSubscription } from './event-subscription';
import { NotificareNotification } from './models/notificare-notification';
import {
  convertNetworkNotificationToPublic,
  NetworkNotificationResponse,
} from './internal/network/responses/notification-response';

let launchState: LaunchState = LaunchState.NONE;

export const SDK_VERSION = '3.0.0';

export function isConfigured(): boolean {
  return launchState >= LaunchState.CONFIGURED;
}

export function isReady(): boolean {
  return launchState >= LaunchState.LAUNCHED;
}

export function configure(options: NotificareOptions) {
  if (launchState >= LaunchState.CONFIGURED) {
    logger.warning('Notificare has already been configured. Skipping...');
    return;
  }

  // TODO: validate the user input
  logger.debug('Configuring notificare.');

  // Hidden property from the consumer options.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { useTestEnvironment } = options;

  let services: NotificareInternalOptionsServices;
  if (useTestEnvironment) {
    services = {
      cloudHost: 'https://cloud-test.notifica.re',
      pushHost: 'https://push-test.notifica.re',
      awsStorageHost: 'https://push-test.notifica.re/upload',
    };
  } else {
    services = {
      cloudHost: 'https://cloud.notifica.re',
      pushHost: 'https://push.notifica.re',
      awsStorageHost: 'https://push.notifica.re/upload',
    };
  }

  setOptions({
    services,
    applicationKey: options.applicationKey,
    applicationSecret: options.applicationSecret,
    applicationVersion: options.applicationVersion ?? '1.0.0',
    applicationHost: `${window.location.protocol}//${window.location.host}`,
    language: options.language,
    serviceWorker: options.serviceWorker,
    serviceWorkerScope: options.serviceWorkerScope,
  });

  // eslint-disable-next-line no-restricted-syntax
  for (const component of components.values()) {
    logger.debug(`Configuring '${component.name}' component.`);
    component.configure();
  }

  launchState = LaunchState.CONFIGURED;
}

export async function launch(): Promise<void> {
  // TODO: check is lib supported
  // TODO: load options from NOTIFICARE_PLUGIN_OPTIONS

  if (launchState === LaunchState.LAUNCHING) {
    logger.warning('Cannot launch again while Notificare is launching.');
    // TODO: throw?
    return;
  }

  if (launchState === LaunchState.LAUNCHED) {
    logger.warning('Notificare has already launched. Skipping...');
    return;
  }

  if (launchState < LaunchState.CONFIGURED) {
    logger.debug('Notificare has not been configured before launching.');

    const response = await request('/config.json', { isAbsolutePath: true });
    const options = await response.json();
    configure(options);

    logger.info('Successfully configured Notificare with config.json.');
  }

  const options = getOptions();
  if (options == null) throw new Error('Unable to load options from /config.json.');

  // TODO: migrate from v2 legacy props
  // TODO: check ignoreNonWebPushDevices
  // TODO: check allowOnlyWebPushSupportedDevices

  const application = await fetchApplication();

  // eslint-disable-next-line no-restricted-syntax
  for (const component of components.values()) {
    logger.debug(`Launching '${component.name}' component.`);

    // eslint-disable-next-line no-await-in-loop
    await component.launch();
  }

  launchState = LaunchState.LAUNCHED;
  printLaunchSummary(application);

  onReadyCallback?.(application);
}

export function getApplication(): NotificareApplication | undefined {
  const applicationStr = localStorage.getItem('re.notifica.application');
  if (!applicationStr) return undefined;

  try {
    return JSON.parse(applicationStr);
  } catch (e) {
    logger.warning('Failed to decode the stored application.', e);

    // Remove the corrupted device from local storage.
    localStorage.removeItem('re.notifica.application');

    return undefined;
  }
}

export async function fetchApplication(): Promise<NotificareApplication> {
  if (!isConfigured()) throw new NotificareNotConfiguredError();

  const response = await request('/api/application/info');

  const { application: networkApplication }: NetworkApplicationResponse = await response.json();
  const application = convertNetworkApplicationToPublic(networkApplication);

  localStorage.setItem('re.notifica.application', JSON.stringify(application));

  return application;
}

export async function fetchNotification(id: string): Promise<NotificareNotification> {
  if (!isConfigured()) throw new NotificareNotConfiguredError();

  const response = await request(`/api/notification/${encodeURIComponent(id)}`);

  const { notification }: NetworkNotificationResponse = await response.json();
  return convertNetworkNotificationToPublic(notification);
}

// region Events

type OnReadyCallback = (application: NotificareApplication) => void;
let onReadyCallback: OnReadyCallback | undefined;

export function onReady(callback: OnReadyCallback): EventSubscription {
  onReadyCallback = callback;

  return {
    remove: () => {
      onReadyCallback = undefined;
    },
  };
}

// endregion

function printLaunchSummary(application: NotificareApplication) {
  if (logger.getLogLevel() >= LogLevel.INFO) {
    logger.info('Notificare is ready.');
    return;
  }

  const enabledServices = Object.entries(application.services)
    .filter(([, enabled]) => enabled)
    .map(([service]) => service);

  const enabledComponents = [...components.keys()].sort();

  logger.debug('/==============================================================================/');
  logger.debug('Notificare SDK is ready to use for application');
  logger.debug(`App name: ${application.name}`);
  logger.debug(`App ID: ${application.id}`);
  logger.debug(`App services: ${enabledServices.join(', ')}`);
  logger.debug('/==============================================================================/');
  logger.debug(`SDK version: ${SDK_VERSION}`);
  logger.debug(`SDK modules: ${enabledComponents.join(', ')}`);
  logger.debug('/==============================================================================/');
}
