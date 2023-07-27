import { Component } from '@notificare/core';
import { setLocationServicesEnabled } from './storage/local-storage';
import { clearLocation } from './internal-api';

/* eslint-disable class-methods-use-this */
export class GeoComponent extends Component {
  constructor() {
    super('geo');
  }

  configure() {
    //
  }

  async launch(): Promise<void> {
    // if (hasLocationServicesEnabled()) {
    //   enableLocationUpdates();
    // }
  }

  async unlaunch(): Promise<void> {
    setLocationServicesEnabled(undefined);

    await clearLocation();
  }
}
