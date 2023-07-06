import { Component } from '@notificare/core';
import { evaluateContext } from './internal-api';
import { logger } from '../logger';

/* eslint-disable class-methods-use-this */
export class IamComponent extends Component {
  constructor() {
    super('in-app-messaging');
  }

  configure() {
    document.addEventListener('visibilitychange', () => {
      const { visibilityState } = document;
      logger.debug(`visibility state = ${visibilityState}`);
    });
  }

  async launch(): Promise<void> {
    evaluateContext('launch');
  }

  async unlaunch(): Promise<void> {
    //
  }
}
