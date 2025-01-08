import { EventSubscription } from '@notificare/web-core';
import { logger } from '../logger';

let inboxUpdatedCallback: OnInboxUpdatedCallback | undefined;
let badgeUpdatedCallback: OnBadgeUpdatedCallback | undefined;

export type OnInboxUpdatedCallback = () => void;
export type OnBadgeUpdatedCallback = (badge: number) => void;

/**
 * Called when the inbox is successfully updated.
 *
 * @param {OnInboxUpdatedCallback} callback - A {@link OnInboxUpdatedCallback} that will be invoked
 * with the result of the onInboxUpdated event.
 * @returns {EventSubscription} - The {@link EventSubscription} for the onInboxUpdated event.
 */
export function onInboxUpdated(callback: OnInboxUpdatedCallback): EventSubscription {
  inboxUpdatedCallback = callback;

  return {
    remove: () => {
      inboxUpdatedCallback = undefined;
    },
  };
}

/**
 * Called when the unread message count badge is updated.
 *
 * @param {OnBadgeUpdatedCallback} callback - A {@link OnBadgeUpdatedCallback} that will be invoked
 * with the result of the onBadgeUpdated event.
 * - The callback receives a single parameter:
 *     - `badge`: The updated unread messages count.
 * @returns {EventSubscription} - The {@link EventSubscription} for the onBadgeUpdated event.
 */
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
