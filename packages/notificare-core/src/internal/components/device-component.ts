import { Component } from '../component';
import { notifyDeviceRegistered } from '../consumer-events';
import {
  registerDeviceInternal,
  registerTemporaryDevice,
  registerTestDevice,
} from '../internal-api-device';
import {
  logApplicationInstall,
  logApplicationRegistration,
  logApplicationUpgrade,
} from '../internal-api-events';
import { launch as launchSession } from '../internal-api-session';
import { logger } from '../logger';
import { getOptions } from '../options';
import { getCurrentDevice } from '../storage/local-storage';
import { getApplicationVersion } from '../utils';

/* eslint-disable class-methods-use-this */
export class DeviceComponent extends Component {
  constructor() {
    super('device');
  }

  configure() {
    //
  }

  async launch(): Promise<void> {
    const device = getCurrentDevice();
    const options = getOptions();

    if (device) {
      // Having a stored device, we can safely launch the session module.
      await launchSession();

      if (device.appVersion !== getApplicationVersion()) {
        // It's not the same version, let's log it as an upgrade.
        logger.debug('New version detected.');
        await logApplicationUpgrade();
      }

      await registerDeviceInternal({
        transport: device.transport,
        token: device.id,
        keys: device.keys,
        userId: device.userId,
        userName: device.userName,
      });
    } else if (!options?.ignoreTemporaryDevices) {
      logger.debug('New install detected.');

      try {
        await registerTemporaryDevice();

        // Having a stored device, we can safely launch the session module.
        await launchSession();

        // We will log the Installation & Registration events here since this will execute only one time at the start.
        await logApplicationInstall();
        await logApplicationRegistration();
      } catch (e) {
        logger.warning('Failed to register temporary device.', e);
        throw e;
      }
    }

    this.handleTestDeviceRegistration();
  }

  async unlaunch(): Promise<void> {
    //
  }

  async postLaunch(): Promise<void> {
    const device = getCurrentDevice();
    if (device) notifyDeviceRegistered(device);
  }

  private handleTestDeviceRegistration() {
    const searchParams = new URLSearchParams(window.location.search);

    const nonce = searchParams.get('notificareTestNonce');
    if (!nonce) return;

    registerTestDevice(nonce)
      .then(() => logger.debug('Test device registered.'))
      .catch((error) => logger.error(`Failed to register the test device: ${error}`));
  }
}
