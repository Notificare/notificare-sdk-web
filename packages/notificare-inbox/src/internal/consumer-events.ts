import { EventSubscription } from '@notificare/web-core';
import { logger } from '../logger';

let inboxUpdatedCallback: OnInboxUpdatedCallback | undefined;
let badgeUpdatedCallback: OnBadgeUpdatedCallback | undefined;

type OnInboxUpdatedCallback = () => void;
type OnBadgeUpdatedCallback = (badge: number) => void;

export function onInboxUpdated(callback: OnInboxUpdatedCallback): EventSubscription {
  inboxUpdatedCallback = callback;

  return {
    remove: () => {
      inboxUpdatedCallback = undefined;
    },
  };
}

export function onBadgeUpdated(callback: OnBadgeUpdatedCallback): EventSubscription {
  badgeUpdatedCallback = callback;

  return {
    remove: () => {
      badgeUpdatedCallback = undefined;
    },
  };
}

export function notifyInboxUpdated() {
  const callback = inboxUpdatedCallback;
  if (!callback) {
    logger.debug("The 'inbox_updated' handler is not configured.");
    return;
  }

  callback();
}

export function notifyBadgeUpdated(badge: number) {
  const callback = badgeUpdatedCallback;
  if (!callback) {
    logger.debug("The 'badge_updated' handler is not configured.");
    return;
  }

  callback(badge);
}
