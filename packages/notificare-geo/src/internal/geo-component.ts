import { Component, getCurrentDevice, getOptions } from '@notificare/web-core';
import { getLocationServicesEnabled, setLocationServicesEnabled } from './storage/local-storage';
import { clearLocation, startLocationUpdates } from './internal-api';
import { logger } from '../logger';

/* eslint-disable class-methods-use-this */
export class GeoComponent extends Component {
  constructor() {
    super('geo');
  }

  migrate() {
    if (localStorage.getItem('notificarePosition')) {
      setLocationServicesEnabled(true);
    }

    localStorage.removeItem('notificarePosition');
    localStorage.removeItem('notificareRegions');
  }

  configure() {
    //
  }

  async launch(): Promise<void> {
    const options = getOptions();
    const device = getCurrentDevice();
    if (options?.ignoreTemporaryDevices && !device) return;

    if (getLocationServicesEnabled()) {
      logger.debug('Automatically starting location updates.');
      startLocationUpdates();
    }
  }

  async unlaunch(): Promise<void> {
    setLocationServicesEnabled(undefined);

    if (!getCurrentDevice()) return;

    await clearLocation();
  }
}
