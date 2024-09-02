import { Component, getApplication, getCurrentDevice } from '@notificare/web-core';
import { logger } from '../logger';
import { notifyInboxUpdated } from './consumer-events';
import { clearInboxInternal, refreshBadgeInternal } from './internal-api';

/* eslint-disable class-methods-use-this */
export class InboxComponent extends Component {
  constructor() {
    super('inbox');
  }

  migrate() {
    const badgeStr = localStorage.getItem('notificareBadge');
    if (badgeStr) {
      const badge = parseInt(badgeStr, 10);
      if (!Number.isNaN(badge)) {
        localStorage.setItem('re.notifica.inbox.badge', badge.toString());
      }
    }

    localStorage.removeItem('notificareBadge');
  }

  configure() {
    //
  }

  async clearStorage(): Promise<void> {
    localStorage.removeItem('re.notifica.inbox.badge');
  }

  async launch(): Promise<void> {
    const application = getApplication();
    if (application?.inboxConfig?.useUserInbox) {
      logger.warning(
        'Using the device-level inbox module, but the user-level inbox is enabled for this application.',
      );
    }
  }

  async unlaunch(): Promise<void> {
    if (!getCurrentDevice()) return;

    await clearInboxInternal();
  }

  async postLaunch(): Promise<void> {
    const application = getApplication();
    const device = getCurrentDevice();

    if (device && application?.inboxConfig?.autoBadge) {
      await refreshBadgeInternal();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  processBroadcast(event: string, data?: unknown) {
    if (event === 'notification_received' || event === 'notification_opened') {
      notifyInboxUpdated();

      const application = getApplication();
      if (application?.inboxConfig?.autoBadge) {
        refreshBadgeInternal().catch((error) =>
          logger.error('Failed to refresh the badge.', error),
        );
      }
    }
  }
}
