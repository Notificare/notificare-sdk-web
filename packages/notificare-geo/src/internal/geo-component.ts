import { Component } from '@notificare/core';
import { enableLocationUpdates, hasLocationServicesEnabled } from '../public-api';

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
    //
  }
}
