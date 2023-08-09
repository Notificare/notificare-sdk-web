import { Component, getApplication } from '@notificare/web-core';
import { logger } from '../logger';
import { clearInboxInternal, refreshBadgeInternal } from './internal-api';

/* eslint-disable class-methods-use-this */
export class InboxComponent extends Component {
  constructor() {
    super('inbox');
  }

  configure() {
    //
  }

  async launch(): Promise<void> {
    const application = getApplication();
    if (application?.inboxConfig?.useUserInbox) {
      logger.warning(
        'Using the device-level inbox module, but the user-level inbox is enabled for this application.',
      );
    }

    await refreshBadgeInternal();
  }

  async unlaunch(): Promise<void> {
    await clearInboxInternal();
  }

  processBroadcast(event: string, data?: unknown) {
    if (event === 'notification_received' || event === 'notification_opened') {
      refreshBadgeInternal().catch((error) => logger.error('Failed to refresh the badge.', error));
    }
  }
}
