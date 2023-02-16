import { request } from './internal/network/request';
import {
  convertNetworkApplicationToPublic,
  NetworkApplicationResponse,
} from './internal/network/models/application';
import { NotificareOptions } from './options';
import { logger } from './internal/logger';
import { getOptions, setOptions } from './internal/options';
import { components } from './internal/components';
import { LaunchState } from './internal/launch-state';
import { NotificareApplication } from './models/notificare-application';
import { NotificareNotConfiguredError } from './errors/notificare-not-configured-error';
import { NotificareNetworkRequestError } from './errors/notificare-network-request-error';

let launchState: LaunchState = LaunchState.NONE;

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
  });

  launchState = LaunchState.CONFIGURED;
}

export async function launch(): Promise<void> {
  // TODO: check is lib supported
  // TODO: check if it has been configured
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
    if (response.ok) {
      const options = await response.json();
      configure(options);

      logger.info('Successfully configured Notificare with config.json.');
    }
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
  logger.info('Notificare is ready.');

  // TODO: print SDK information
}

export async function fetchApplication(): Promise<NotificareApplication> {
  if (!isConfigured()) throw new NotificareNotConfiguredError();

  const response = await request('/api/application/info');
  if (!response.ok) throw new NotificareNetworkRequestError(response);

  const { application }: NetworkApplicationResponse = await response.json();
  return convertNetworkApplicationToPublic(application);
}
