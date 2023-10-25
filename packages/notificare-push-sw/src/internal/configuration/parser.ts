import { WorkerConfiguration } from './worker-configuration';
import { logger } from '../../logger';
import { base64Decode, getServiceWorkerLocation } from '../utils';

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

  return {
    applicationKey,
    applicationSecret,
    useTestEnvironment: config.useTestEnvironment,
    standalone: config.standalone,
  };
}
