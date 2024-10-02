import { Component } from '../component';
import { notifyDeviceRegistered } from '../consumer-events';
import {
  createDevice,
  deleteDevice,
  registerTestDevice,
  updateDevice,
  upgradeToLongLivedDeviceWhenNeeded,
} from '../internal-api-device';
import {
  logApplicationInstall,
  logApplicationRegistration,
  logApplicationUpgrade,
} from '../internal-api-events';
import { launch as launchSession, unlaunch as unlaunchSession } from '../internal-api-session';
import { isReady } from '../launch-state';
import { logger } from '../logger';
import { getOptions } from '../options';
import { asPublicDevice, getStoredDevice } from '../storage/local-storage';
import { getApplicationVersion } from '../utils';

/* eslint-disable class-methods-use-this */
export class DeviceComponent extends Component {
  private hasPendingDeviceRegistrationEvent = false;

  constructor() {
    super('device');
  }

  configure() {
    //
  }

  async launch(): Promise<void> {
    await upgradeToLongLivedDeviceWhenNeeded();

    const device = getStoredDevice();
    const options = getOptions();

    if (!device && !options?.ignoreTemporaryDevices) {
      logger.debug('New install detected.');

      try {
        await this.handleCreateDeviceWithSession();
      } catch (e) {
        logger.warning('Failed to register temporary device.', e);
        throw e;
      }
    } else if (device) {
      const isApplicationUpgrade = device.appVersion !== getApplicationVersion();

      await updateDevice();

      // Having a stored device, we can safely launch the session module.
      await launchSession();

      if (isApplicationUpgrade) {
        // It's not the same version, let's log it as an upgrade.
        logger.debug('New version detected.');
        await logApplicationUpgrade();
      }
    } else {
      logger.debug('Ignoring temporary devices.');
    }

    this.handleTestDeviceRegistration();
  }

  async unlaunch(): Promise<void> {
    //
  }

  async postLaunch(): Promise<void> {
    const device = getStoredDevice();
    if (device && this.hasPendingDeviceRegistrationEvent) {
      notifyDeviceRegistered(asPublicDevice(device));
      this.hasPendingDeviceRegistrationEvent = false;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-shadow
  async executeCommand(command: string, data?: unknown): Promise<unknown> {
    if (command === 'createDevice') {
      await this.handleCreateDeviceWithSession();
      return;
    }

    if (command === 'deleteDevice') {
      await this.handleDeleteDeviceWithSession();
      return;
    }

    throw new Error(`Unsupported command '${command}' in '${this.name}' component.`);
  }

  private handleTestDeviceRegistration() {
    const searchParams = new URLSearchParams(window.location.search);

    const nonce = searchParams.get('notificareTestNonce');
    if (!nonce) return;

    registerTestDevice(nonce)
      .then(() => logger.debug('Test device registered.'))
      .catch((error) => logger.error(`Failed to register the test device: ${error}`));
  }

  private async handleCreateDeviceWithSession() {
    await createDevice();

    if (isReady()) {
      const device = getStoredDevice();
      if (device) notifyDeviceRegistered(asPublicDevice(device));
    } else {
      this.hasPendingDeviceRegistrationEvent = true;
    }

    // Having a stored device, we can safely launch the session module.
    await launchSession();

    // We will log the Installation & Registration events here since this will execute only one time at the start.
    await logApplicationInstall();
    await logApplicationRegistration();
  }

  private async handleDeleteDeviceWithSession() {
    await unlaunchSession();
    await deleteDevice();
  }
}
