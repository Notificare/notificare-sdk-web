import { parseWorkerConfiguration } from '../configuration/parser';
import { InvalidWorkerConfigurationError } from '../configuration/errors';

export async function getCloudApiEnvironment() {
  const configuration = parseWorkerConfiguration();
  if (!configuration) throw new InvalidWorkerConfigurationError();

  return {
    useTestEnvironment: configuration.useTestEnvironment ?? false,
    applicationKey: configuration.applicationKey,
    applicationSecret: configuration.applicationSecret,
  };
}
