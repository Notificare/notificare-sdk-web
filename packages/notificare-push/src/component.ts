import { Component } from '@notificare/core';

export class PushComponent extends Component {
  constructor() {
    super('push');
  }

  // eslint-disable-next-line class-methods-use-this
  launch(): Promise<void> {
    return Promise.resolve();
  }
}
