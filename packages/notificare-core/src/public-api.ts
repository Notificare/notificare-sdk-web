import {
  setLogLevel as setLogLevelInternal,
  LogLevel,
  LogLevelString,
} from '@notificare/web-logger';
import { request } from './internal/network/request';
import {
  convertNetworkApplicationToPublic,
  NetworkApplicationResponse,
} from './internal/network/responses/application-response';
import { NotificareOptions } from './options';
import { logger } from './internal/logger';
import { getOptions, NotificareInternalOptionsServices, setOptions } from './internal/options';
import {
  getLaunchState,
  isConfigured as isConfiguredInternal,
  isReady as isReadyInternal,
  LaunchState,
  setLaunchState,
} from './internal/launch-state';
import { NotificareApplication } from './models/notificare-application';
import { NotificareNotConfiguredError } from './errors/notificare-not-configured-error';
import { components } from './internal/component-cache';
import {
  NotificareNotification,
  NotificareNotificationAction,
} from './models/notificare-notification';
import {
  convertNetworkNotificationToPublic,
  NetworkNotificationResponse,
} from './internal/network/responses/notification-response';
import { notifyOnReady, notifyUnlaunched } from './internal/consumer-events';
import { NotificareNotReadyError } from './errors/notificare-not-ready-error';
import { clearTags, getCurrentDevice } from './public-api-device';
import { SDK_VERSION as SDK_VERSION_INTERNAL } from './internal/version';
import { deleteDevice, registerTemporaryDevice } from './internal/internal-api-device';
import { NotificareDeviceUnavailableError } from './errors/notificare-device-unavailable-error';
import { isLatestStorageStructure, migrate } from './internal/migration-flow';

export const SDK_VERSION: string = SDK_VERSION_INTERNAL;

export { onReady, onUnlaunched, onDeviceRegistered } from './internal/consumer-events';

export function setLogLevel(logLevel: LogLevel | LogLevelString) {
  setLogLevelInternal(logLevel);
}

export function isConfigured(): boolean {
  return isConfiguredInternal();
}

export function isReady(): boolean {
  return isReadyInternal();
}

export function configure(options: NotificareOptions) {
  if (getLaunchState() >= LaunchState.CONFIGURED) {
    logger.warning('Notificare has already been configured. Skipping...');
    return;
  }

  logger.debug('Configuring notificare.');

  if (!options?.applicationKey || !options?.applicationSecret) {
    throw new Error('Unable to configure Notificare without a valid set of application keys.');
  }

  if (!isLatestStorageStructure()) {
    migrate();
  }

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
      websitePushHost: 'https://push-test.notifica.re/website-push/safari',
    };
  } else {
    services = {
      cloudHost: 'https://cloud.notifica.re',
      pushHost: 'https://push.notifica.re',
      awsStorageHost: 'https://push.notifica.re/upload',
      websitePushHost: 'https://push.notifica.re/website-push/safari',
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
    geolocation: options.geolocation,
  });

  // eslint-disable-next-line no-restricted-syntax
  for (const component of components.values()) {
    logger.debug(`Configuring '${component.name}' component.`);
    component.configure();
  }

  setLaunchState(LaunchState.CONFIGURED);
}

export async function launch(): Promise<void> {
  // TODO: check is lib supported

  if (getLaunchState() === LaunchState.LAUNCHING) {
    logger.warning('Cannot launch again while Notificare is launching.');
    throw new Error('Cannot launch again while Notificare is launching.');
  }

  if (getLaunchState() === LaunchState.LAUNCHED) {
    logger.warning('Notificare has already launched. Skipping...');
    return;
  }

  if (getLaunchState() < LaunchState.CONFIGURED) {
    logger.debug('Fetching remote configuration.');

    const response = await request('/notificare-services.json', { isAbsolutePath: true });
    const options = await response.json();
    configure(options);

    logger.info('Successfully configured Notificare with notificare-services.json.');
  }

  const options = getOptions();
  if (options == null) throw new Error('Unable to load options from /notificare-services.json.');

  // TODO: migrate from v2 legacy props
  // TODO: check ignoreNonWebPushDevices
  // TODO: check allowOnlyWebPushSupportedDevices

  try {
    setLaunchState(LaunchState.LAUNCHING);

    const application = await fetchApplication();

    // eslint-disable-next-line no-restricted-syntax
    for (const component of components.values()) {
      logger.debug(`Launching '${component.name}' component.`);

      // eslint-disable-next-line no-await-in-loop
      await component.launch();
    }

    setLaunchState(LaunchState.LAUNCHED);
    printLaunchSummary(application);

    notifyOnReady(application);
  } catch (e) {
    logger.error('Failed to launch Notificare.', e);
    setLaunchState(LaunchState.CONFIGURED);
  }
}

export async function unlaunch(): Promise<void> {
  if (!isReady()) {
    logger.warning('Cannot un-launch Notificare before it has been launched.');
    throw new NotificareNotReadyError();
  }

  logger.info('Un-launching Notificare.');

  try {
    // eslint-disable-next-line no-restricted-syntax
    for (const component of Array.from(components.values()).reverse()) {
      logger.debug(`Un-launching the '${component.name}' component.`);

      try {
        // eslint-disable-next-line no-await-in-loop
        await component.unlaunch();
      } catch (e) {
        logger.debug(`Failed to un-launch the '${component.name}' component.`, e);

        // noinspection ExceptionCaughtLocallyJS
        throw e;
      }
    }

    logger.debug('Clearing device tags.');
    await clearTags();

    logger.debug('Registering a temporary device.');
    await registerTemporaryDevice();

    logger.debug('Removing device.');
    await deleteDevice();

    logger.info('Un-launched Notificare.');
    setLaunchState(LaunchState.CONFIGURED);

    notifyUnlaunched();
  } catch (e) {
    logger.error('Failed to launch Notificare.', e);
  }
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

  const options = getOptions();
  if (!options) throw new NotificareNotConfiguredError();

  const queryParameters = new URLSearchParams();
  if (options.language) queryParameters.set('language', options.language);

  const encodedQueryParameters = queryParameters.toString();
  let url = '/api/application/info';
  if (encodedQueryParameters) {
    url = url.concat('?', encodedQueryParameters);
  }

  const response = await request(url);

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

export async function createNotificationReply(
  notification: NotificareNotification,
  action: NotificareNotificationAction,
  data?: NotificationReplyData,
): Promise<void> {
  if (!isConfigured()) throw new NotificareNotConfiguredError();

  const options = getOptions();
  if (!options) throw new NotificareNotConfiguredError();

  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  let mediaUrl: string | undefined;

  if (data?.media && data?.mimeType) {
    const formData = new FormData();
    formData.append('file', data.media);

    const response = await request(`/api/upload/reply`, {
      method: 'POST',
      formData,
    });

    const { filename } = await response.json();
    mediaUrl = `${options.services.awsStorageHost}${filename}`;
  }

  await request('/api/reply', {
    method: 'POST',
    body: {
      notification: notification.id,
      deviceID: device.id,
      userID: device.userId,
      label: action.label,
      data: {
        target: action.target,
        message: data?.message,
        media: mediaUrl,
        mimeType: data?.mimeType,
      },
    },
  });
}

export interface NotificationReplyData {
  message?: string;
  media?: Blob;
  mimeType?: string;
}

export async function callNotificationWebhook(
  notification: NotificareNotification,
  action: NotificareNotificationAction,
): Promise<void> {
  if (!action.target) throw new Error('Unable to execute webhook without a target for the action.');

  const url = new URL(action.target);

  const device = getCurrentDevice();
  const data: Record<string, string> = {};

  // Populate the data with the target's query parameters.
  url.searchParams.forEach((key) => {
    const value = url.searchParams.get(key);
    if (value) data[key] = value;
  });

  data.target = url.origin;
  data.label = action.label;
  data.notificationID = notification.id;
  if (device?.id) data.deviceID = device.id;
  if (device?.userId) data.userID = device.userId;

  await request('/api/reply/webhook', {
    method: 'POST',
    body: data,
  });
}

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
