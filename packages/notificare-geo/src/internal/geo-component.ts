import { Component, getCurrentDevice, getOptions } from '@notificare/web-core';
import { logger } from '../logger';
import { clearLocation, startLocationUpdates } from './internal-api';
import {
  getLocationServicesEnabled,
  setCurrentLocation,
  setLocationServicesEnabled,
} from './storage/local-storage';

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

  async clearStorage(): Promise<void> {
    setLocationServicesEnabled(undefined);
    setCurrentLocation(undefined);
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
