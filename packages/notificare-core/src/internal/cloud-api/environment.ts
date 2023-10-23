import { getOptions } from '../options';
import { NotificareNotConfiguredError } from '../../errors/notificare-not-configured-error';

export function getCloudApiEnvironment() {
  const options = getOptions();
  if (!options) throw new NotificareNotConfiguredError();

  return {
    useTestEnvironment: options.useTestEnvironment ?? false,
    applicationKey: options.applicationKey,
    applicationSecret: options.applicationSecret,
  };
}
