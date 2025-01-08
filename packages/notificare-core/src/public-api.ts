import {
  callCloudNotificationWebhook,
  CloudNotificationWebhookPayload,
  createCloudNotificationReply,
  fetchCloudApplication,
  fetchCloudDynamicLink,
  fetchCloudNotification,
  NotificareNetworkRequestError,
  request,
  uploadCloudNotificationReplyMedia,
} from '@notificare/web-cloud-api';
import {
  LogLevel,
  LogLevelString,
  setLogLevel as setLogLevelInternal,
} from '@notificare/web-logger';
import { NotificareDeviceUnavailableError } from './errors/notificare-device-unavailable-error';
import { NotificareNotConfiguredError } from './errors/notificare-not-configured-error';
import { NotificareNotReadyError } from './errors/notificare-not-ready-error';
import { convertCloudApplicationToPublic } from './internal/cloud-api/converters/application-converter';
import { convertCloudDynamicLinkToPublic } from './internal/cloud-api/converters/dynamic-link-converter';
import { convertCloudNotificationToPublic } from './internal/cloud-api/converters/notification-converter';
import { getCloudApiEnvironment } from './internal/cloud-api/environment';
import { components } from './internal/component-cache';
import { notifyOnReady, notifyUnlaunched } from './internal/consumer-events';
import { deleteDevice } from './internal/internal-api-device';
import {
  getLaunchState,
  isConfigured as isConfiguredInternal,
  isReady as isReadyInternal,
  LaunchState,
  setLaunchState,
} from './internal/launch-state';
import { logger } from './internal/logger';
import { isLatestStorageStructure, migrate } from './internal/migration-flow';
import {
  DEFAULT_CLOUD_API_HOST,
  DEFAULT_REST_API_HOST,
  getOptions,
  isDefaultHosts,
  NotificareInternalOptionsHosts,
  setOptions,
} from './internal/options';
import {
  clearStorage,
  getStoredApplication,
  getStoredDevice,
  setStoredApplication,
} from './internal/storage/local-storage';
import { hasWebPushSupport } from './internal/utils';
import { SDK_VERSION as SDK_VERSION_INTERNAL } from './internal/version';
import { NotificareApplication } from './models/notificare-application';
import { NotificareDynamicLink } from './models/notificare-dynamic-link';
import {
  NotificareNotification,
  NotificareNotificationAction,
} from './models/notificare-notification';
import { NotificareOptions } from './options';

export const SDK_VERSION: string = SDK_VERSION_INTERNAL;

export {
  onReady,
  onUnlaunched,
  onDeviceRegistered,
  OnDeviceRegisteredCallback,
  OnReadyCallback,
  OnUnlaunchedCallback,
} from './internal/consumer-events';

/**
 * Sets the logging level for the SDK.
 *
 * @param {LogLevel | LogLevelString} logLevel - The desired logging level, which can be specified
 * as either:
 *  - A {@link LogLevel} enum value.
 *  - A {@link LogLevelString} string representation of the log level.
 */
export function setLogLevel(logLevel: LogLevel | LogLevelString) {
  setLogLevelInternal(logLevel);
}

/**
 * Indicates whether Notificare has been configured.
 *
 * @returns {boolean} - `true` if Notificare is successfully configured, and `false` otherwise.
 */
export function isConfigured(): boolean {
  return isConfiguredInternal();
}

/**
 * Indicates whether Notificare is ready.
 *
 * @returns {boolean} - `true` once the SDK has completed the initialization process and is ready
 * for use.
 */
export function isReady(): boolean {
  return isReadyInternal();
}

/**
 * Configures Notificare using the services info in a provided {@link NotificareOptions} object.
 *
 * This method configures the SDK using the {@link NotificareOptions} object, preparing it for use.
 *
 * @param {NotificareOptions} options - The {@link NotificareOptions} object to use for configuration.
 */
export function configure(options: NotificareOptions) {
  const state = getLaunchState();

  if (state > LaunchState.CONFIGURED) {
    logger.warning('Unable to reconfigure Notificare once launched.');
    return;
  }

  if (state === LaunchState.CONFIGURED) {
    logger.info('Reconfiguring Notificare with another set of application keys.');
  }

  logger.debug('Configuring notificare.');

  if (!options?.applicationKey || !options?.applicationSecret) {
    throw new Error('Unable to configure Notificare without a valid set of application keys.');
  }

  if (!isLatestStorageStructure()) {
    migrate();
  }

  const hosts: NotificareInternalOptionsHosts = {
    cloudApi: options.hosts?.cloudApi ?? DEFAULT_CLOUD_API_HOST,
    restApi: options.hosts?.restApi ?? DEFAULT_REST_API_HOST,
  };

  setOptions({
    hosts,
    applicationKey: options.applicationKey,
    applicationSecret: options.applicationSecret,
    applicationVersion: options.applicationVersion ?? '1.0.0',
    ignoreTemporaryDevices: options.ignoreTemporaryDevices,
    ignoreUnsupportedWebPushDevices: options.ignoreUnsupportedWebPushDevices,
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

  if (!isDefaultHosts(hosts)) {
    logger.info('Notificare configured with customized hosts.');
    logger.debug(`Cloud API host: ${hosts.cloudApi}`);
    logger.debug(`REST API host: ${hosts.restApi}`);
  }
}

/**
 * Launches the Notificare SDK, and all the additional available modules, preparing them for use.
 *
 * @returns {Promise<void>} - A promise that resolves when the Notificare SDK
 * and its modules have been successfully launched and are ready for use.
 */
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

    const response = await request({ url: '/notificare-services.json' });
    const options = await response.json();
    configure(options);

    logger.info('Successfully configured Notificare with notificare-services.json.');
  }

  const options = getOptions();
  if (options == null) throw new Error('Unable to load options from /notificare-services.json.');

  if (options.ignoreUnsupportedWebPushDevices) {
    let isWebPushCapable = false;

    try {
      logger.debug('Checking for web push support.');
      isWebPushCapable = await hasWebPushSupport();
    } catch (e) {
      logger.warning('Failed to check for web push support.', e);
    }

    if (!isWebPushCapable)
      throw new Error('Unable to launch Notificare when the device is not capable of Web Push.');
  }

  try {
    setLaunchState(LaunchState.LAUNCHING);

    const application = await fetchApplicationInternal({ saveToLocalStorage: false });
    const storedApplication = getStoredApplication();

    if (storedApplication && storedApplication.id !== application.id) {
      logger.warning('Incorrect application keys detected. Resetting Notificare to a clean state.');

      // eslint-disable-next-line no-restricted-syntax
      for (const component of components.values()) {
        logger.debug(`Resetting '${component.name}' component.`);

        // eslint-disable-next-line no-await-in-loop
        await component.clearStorage();
      }

      clearStorage();
    }

    setStoredApplication(application);

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

    if (e instanceof NotificareNetworkRequestError && e.response.status === 403) {
      logger.error(
        `The origin ${window.location.origin} is not configured. See https://docs.notifica.re/guides/v3/settings/services/website-push/#allowed-domains for more information.`,
      );
    }

    setLaunchState(LaunchState.CONFIGURED);
    throw e;
  }

  // We don't want the launch() promise to be held for the postLaunch().
  postLaunch().catch((e) => logger.error('Failed to execute the post-launch step.', e));
}

/**
 * Unlaunches the Notificare SDK.
 *
 * This method shuts down the SDK, removing all data, both locally and remotely in
 * the servers. It destroys all the device's data permanently.
 *
 * @returns {Promise<void>} - A promise that resolves when the SDK has been
 * successfully unlaunched and all data has been removed.
 */
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

    if (getStoredDevice()) {
      logger.debug('Removing device.');
      await deleteDevice();
    }

    setStoredApplication(undefined);
    localStorage.removeItem('re.notifica.migrated');

    logger.info('Un-launched Notificare.');
    setLaunchState(LaunchState.CONFIGURED);

    notifyUnlaunched();
  } catch (e) {
    logger.error('Failed to un-launch Notificare.', e);
    throw e;
  }
}

/**
 * Provides the current application metadata, if available.
 *
 * @returns {NotificareApplication | undefined} - The {@link NotificareApplication} object
 * representing the configured application, or `undefined` if the application is not yet available.
 *
 * @see {@link NotificareApplication}
 */
export function getApplication(): NotificareApplication | undefined {
  return getStoredApplication();
}

/**
 * Fetches the application metadata.
 *
 * @returns {Promise<NotificareApplication>} - A promise that resolves to a
 * {@link NotificareApplication} object containing the application metadata.
 */
export async function fetchApplication(): Promise<NotificareApplication> {
  return fetchApplicationInternal({ saveToLocalStorage: true });
}

/**
 * Fetches a {@link NotificareNotification} by its ID.
 *
 * @param {string} id - The ID of the notification to fetch.
 * @returns {Promise<NotificareNotification>} - A promise that resolves to a
 * {@link NotificareNotification} object associated with the provided ID.
 */
export async function fetchNotification(id: string): Promise<NotificareNotification> {
  if (!isConfigured()) throw new NotificareNotConfiguredError();

  const { notification } = await fetchCloudNotification({
    environment: getCloudApiEnvironment(),
    id,
  });

  return convertCloudNotificationToPublic(notification);
}

/**
 * Fetches a {@link NotificareDynamicLink} from an url.
 *
 * @param {string} url - The url to fetch the dynamic link from.
 * @returns {Promise<NotificareDynamicLink>} - A promise that resolves to a
 * {@link NotificareDynamicLink} object.
 */
export async function fetchDynamicLink(url: string): Promise<NotificareDynamicLink> {
  if (!isConfigured()) throw new NotificareNotConfiguredError();

  const device = getStoredDevice();

  const { link } = await fetchCloudDynamicLink({
    environment: getCloudApiEnvironment(),
    deviceId: device?.id,
    url,
  });

  return convertCloudDynamicLinkToPublic(link);
}

/**
 * Sends a reply to a notification action.
 *
 * This method sends a reply to the specified {@link NotificareNotification} and
 * {@link NotificareNotificationAction}, optionally including a message and media.
 *
 * @param {NotificareNotification} notification - The notification to reply to.
 * @param {NotificareNotificationAction} action - The action associated with the reply.
 * @param {NotificationReplyData} data - An {@link NotificationReplyData} object containing the reply.
 * @returns {Promise<void>} - A promise that resolves once the reply has been sent.
 */
export async function createNotificationReply(
  notification: NotificareNotification,
  action: NotificareNotificationAction,
  data?: NotificationReplyData,
): Promise<void> {
  if (!isConfigured()) throw new NotificareNotConfiguredError();

  const options = getOptions();
  if (!options) throw new NotificareNotConfiguredError();

  const device = getStoredDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  let mediaUrl: string | undefined;

  if (data?.media && data?.mimeType) {
    const { filename } = await uploadCloudNotificationReplyMedia({
      environment: getCloudApiEnvironment(),
      media: data.media,
    });

    mediaUrl = `https://${options.hosts.restApi}/upload${filename}`;
  }

  await createCloudNotificationReply({
    environment: getCloudApiEnvironment(),
    payload: {
      notification: notification.id,
      label: action.label,
      deviceID: device.id,
      userID: device.userId,
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

/**
 * Calls a webhook associated with a notification action.
 *
 * This method sends a payload to the specified webhook target URL defined in the notification action.
 *
 * @param {NotificareNotification} notification - The {@link NotificareNotification} containing
 * details about the notification.
 * @param {NotificareNotificationAction} action - The {@link NotificareNotificationAction} that
 * triggers the webhook.
 * @returns {Promise<void>} - A promise that resolves when the webhook has been successfully called.
 */
export async function callNotificationWebhook(
  notification: NotificareNotification,
  action: NotificareNotificationAction,
): Promise<void> {
  if (!action.target) throw new Error('Unable to execute webhook without a target for the action.');

  const url = new URL(action.target);
  const device = getStoredDevice();

  const data: CloudNotificationWebhookPayload = {
    target: url.origin,
    label: action.label,
    notificationID: notification.id,
    deviceID: device?.id,
    userID: device?.userId,
  };

  // Populate the data with the target's query parameters.
  url.searchParams.forEach((key) => {
    const value = url.searchParams.get(key);
    if (value !== null) data[key] = value;
  });

  await callCloudNotificationWebhook({
    environment: getCloudApiEnvironment(),
    payload: data,
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

async function postLaunch() {
  // eslint-disable-next-line no-restricted-syntax
  for (const component of components.values()) {
    try {
      logger.debug(`Post-launch '${component.name}' component.`);

      // eslint-disable-next-line no-await-in-loop
      await component.postLaunch();
    } catch (e) {
      logger.error(`Failed to post-launch the '${component.name}' component.`, e);
    }
  }
}

async function fetchApplicationInternal({
  saveToLocalStorage,
}: {
  saveToLocalStorage: boolean;
}): Promise<NotificareApplication> {
  if (!isConfigured()) throw new NotificareNotConfiguredError();

  const options = getOptions();
  if (!options) throw new NotificareNotConfiguredError();

  const { application: cloudApplication } = await fetchCloudApplication({
    environment: getCloudApiEnvironment(),
    language: options.language,
  });

  const application = convertCloudApplicationToPublic(cloudApplication);

  if (saveToLocalStorage) {
    setStoredApplication(application);
  }

  return application;
}
