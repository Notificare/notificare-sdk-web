import { Component } from '@notificare/web-core';
import { evaluateContext, handleDocumentVisibilityChanged } from './internal-api';

/* eslint-disable class-methods-use-this */
export class IamComponent extends Component {
  constructor() {
    super('in-app-messaging');
  }

  configure() {
    document.addEventListener('visibilitychange', () => {
      const { visibilityState } = document;
      handleDocumentVisibilityChanged(visibilityState);
    });
  }

  async launch(): Promise<void> {
    evaluateContext('launch');
  }

  async unlaunch(): Promise<void> {
    //
  }
}
