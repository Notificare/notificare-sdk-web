import { InvalidWorkerConfigurationError } from '../configuration/errors';
import { parseWorkerConfiguration } from '../configuration/parser';

export async function getCloudApiEnvironment() {
  const configuration = parseWorkerConfiguration();
  if (!configuration) throw new InvalidWorkerConfigurationError();

  return {
    cloudHost: configuration.cloudHost,
    applicationKey: configuration.applicationKey,
    applicationSecret: configuration.applicationSecret,
  };
}
