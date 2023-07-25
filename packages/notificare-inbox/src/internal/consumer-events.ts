import { EventSubscription } from '@notificare/core';
import { logger } from '../logger';

let badgeUpdatedCallback: OnBadgeUpdatedCallback | undefined;

type OnBadgeUpdatedCallback = (badge: number) => void;

export function onBadgeUpdated(callback: OnBadgeUpdatedCallback): EventSubscription {
  badgeUpdatedCallback = callback;

  return {
    remove: () => {
      badgeUpdatedCallback = undefined;
    },
  };
}

export function notifyBadgeUpdated(badge: number) {
  const callback = badgeUpdatedCallback;
  if (!callback) {
    logger.debug("The 'badge_updated' handler is not configured.");
    return;
  }

  callback(badge);
}
