import { InvalidWorkerConfigurationError } from '../configuration/errors';
import { parseWorkerConfiguration } from '../configuration/parser';

export async function getCloudApiEnvironment() {
  const configuration = parseWorkerConfiguration();
  if (!configuration) throw new InvalidWorkerConfigurationError();

  return {
    useTestEnvironment: configuration.useTestEnvironment ?? false,
    applicationKey: configuration.applicationKey,
    applicationSecret: configuration.applicationSecret,
  };
}
