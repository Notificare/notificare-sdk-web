import { LogLevel } from '@notificare/logger';
import { request } from './internal/network/request';
import {
  convertNetworkApplicationToPublic,
  NetworkApplicationResponse,
} from './internal/network/responses/application-response';
import { NotificareOptions } from './options';
import { logger } from './internal/logger';
import { getOptions, setOptions } from './internal/options';
import { LaunchState } from './internal/launch-state';
import { NotificareApplication } from './models/notificare-application';
import { NotificareNotConfiguredError } from './errors/notificare-not-configured-error';
import { components } from './internal/component-cache';

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

  setOptions({
    // TODO: consider adding an (test) environment option.
    services: {
      cloudHost: 'https://cloud.notifica.re',
      pushHost: 'https://push.notifica.re',
    },
    applicationKey: options.applicationKey,
    applicationSecret: options.applicationSecret,
    applicationVersion: options.applicationVersion ?? '1.0.0',
    applicationHost: `${window.location.protocol}//${window.location.host}`,
    mode: options.mode ?? 'manual',
    serviceWorker: options.serviceWorker,
    serviceWorkerScope: options.serviceWorkerScope,
  });

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
  localStorage.setItem('re.notifica.application', JSON.stringify(application));

  // eslint-disable-next-line no-restricted-syntax
  for (const component of components.values()) {
    logger.debug(`Launching '${component.name}' component.`);

    // eslint-disable-next-line no-await-in-loop
    await component.launch();
  }

  launchState = LaunchState.LAUNCHED;
  printLaunchSummary(application);
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

  const { application }: NetworkApplicationResponse = await response.json();
  return convertNetworkApplicationToPublic(application);
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
