import { Component } from '../component';
import {
  handleDocumentBeforeUnload,
  handleDocumentVisibilityChanged,
  unlaunch as unlaunchSession,
} from '../internal-api-session';
import { logger } from '../logger';

/* eslint-disable class-methods-use-this */
export class SessionComponent extends Component {
  constructor() {
    super('session');
  }

  configure() {
    window.addEventListener(
      'visibilitychange',
      async () => {
        try {
          await handleDocumentVisibilityChanged();
        } catch (e) {
          logger.error('Failed to handle a document visibility changed event.', e);
        }
      },
      false,
    );

    window.addEventListener('beforeunload', handleDocumentBeforeUnload);
  }

  /**
   * This component does not partake in the launch flow because the
   * session module needs to be launched **after** a device is registered
   * but before any other events are logged.
   */
  async launch(): Promise<void> {
    //
  }

  async unlaunch(): Promise<void> {
    await unlaunchSession();
  }
}
