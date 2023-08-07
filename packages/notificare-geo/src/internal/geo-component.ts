import { Component } from '@notificare/core';
import { getLocationServicesEnabled, setLocationServicesEnabled } from './storage/local-storage';
import { clearLocation, startLocationUpdates } from './internal-api';
import { logger } from '../logger';

/* eslint-disable class-methods-use-this */
export class GeoComponent extends Component {
  constructor() {
    super('geo');
  }

  configure() {
    //
  }

  async launch(): Promise<void> {
    if (getLocationServicesEnabled()) {
      logger.debug('Automatically starting location updates.');
      startLocationUpdates();
    }
  }

  async unlaunch(): Promise<void> {
    setLocationServicesEnabled(undefined);

    await clearLocation();
  }
}
