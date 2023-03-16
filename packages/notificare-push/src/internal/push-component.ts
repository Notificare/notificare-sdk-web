import { Component } from '@notificare/core';
import { handleServiceWorkerMessage, hasWebPushSupport } from './internal-api-web-push';

/* eslint-disable class-methods-use-this */
export class PushComponent extends Component {
  constructor() {
    super('push');
  }

  configure() {
    //
    if (hasWebPushSupport()) {
      navigator.serviceWorker.onmessage = handleServiceWorkerMessage;
    }
  }

  async launch(): Promise<void> {
    //
  }

  async unlaunch(): Promise<void> {
    //
  }
}
