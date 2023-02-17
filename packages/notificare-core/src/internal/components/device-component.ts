import { Component } from '../component';
import {
  getCurrentDevice,
  registerDeviceInternal,
  registerTemporaryDevice,
} from '../internal-api-device';
import { logger } from '../logger';
import { getApplicationVersion } from '../utils';

export class DeviceComponent extends Component {
  constructor() {
    super('device');
  }

  // eslint-disable-next-line class-methods-use-this
  async launch(): Promise<void> {
    const device = getCurrentDevice();

    if (device) {
      if (device.appVersion !== getApplicationVersion()) {
        // It's not the same version, let's log it as an upgrade.
        logger.debug('New version detected');
        // TODO: logApplicationUpgrade()
      }

      await registerDeviceInternal({
        transport: device.transport,
        token: device.id,
        userId: device.userId,
        userName: device.userName,
      });
    } else {
      logger.debug('New install detected.');

      try {
        await registerTemporaryDevice();

        // We will log the Install & Registration events here since this will execute only one time at the start.
        // TODO: logApplicationInstall()
        // TODO: logApplicationRegistration()
      } catch (e) {
        logger.warning('Failed to register temporary device.', e);
        throw e;
      }
    }
  }
}
