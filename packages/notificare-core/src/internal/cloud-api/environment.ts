import { NotificareNotConfiguredError } from '../../errors/notificare-not-configured-error';
import { getOptions } from '../options';

export function getCloudApiEnvironment() {
  const options = getOptions();
  if (!options) throw new NotificareNotConfiguredError();

  return {
    cloudHost: options.hosts.cloudApi,
    applicationKey: options.applicationKey,
    applicationSecret: options.applicationSecret,
  };
}
