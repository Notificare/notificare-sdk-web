import { logger } from '../../logger';
import { base64Decode, getServiceWorkerLocation } from '../utils';
import { InvalidWorkerConfigurationError } from './errors';
import { WorkerConfiguration } from './worker-configuration';

export function parseWorkerConfiguration(): WorkerConfiguration | undefined {
  const location = getServiceWorkerLocation();
  const searchParams = new URLSearchParams(location.search);

  const encodedConfig = searchParams.get('notificareConfig');
  if (!encodedConfig) {
    logger.warning('Cannot parse the worker configuration: missing config.');
    return undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let config: any;

  try {
    const decoded = base64Decode(encodedConfig);
    config = JSON.parse(decoded);
  } catch (e) {
    logger.warning('Cannot parse the worker configuration: unable to decode the config.');
    return undefined;
  }

  const { cloudHost } = config;
  if (!cloudHost) {
    logger.warning('Cannot parse the worker configuration: missing cloud host.');
    return undefined;
  }

  const { applicationId } = config;
  if (!applicationId) {
    // The service worker was updated on the background and the user hasn't opened
    // the website yet to update the worker registration.
    logger.warning('Parsing older worker configuration: missing application id.');
  }

  const { applicationKey } = config;
  if (!applicationKey) {
    logger.warning('Cannot parse the worker configuration: missing application key.');
    return undefined;
  }

  const { applicationSecret } = config;
  if (!applicationSecret) {
    logger.warning('Cannot parse the worker configuration: missing application secret.');
    return undefined;
  }

  const { deviceId } = config;
  if (!deviceId) {
    logger.warning('Cannot parse the worker configuration: missing device id.');
    return undefined;
  }

  return {
    cloudHost,
    applicationId,
    applicationKey,
    applicationSecret,
    deviceId,
    standalone: config.standalone,
  };
}

export function getCurrentDeviceId(): string {
  const configuration = parseWorkerConfiguration();
  if (!configuration) throw new InvalidWorkerConfigurationError();

  return configuration.deviceId;
}
