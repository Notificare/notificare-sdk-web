import {
  clearCloudDeviceInbox,
  fetchCloudDeviceInbox,
  markCloudDeviceInboxAsRead,
  removeCloudDeviceInboxItem,
} from '@notificare/web-cloud-api';
import {
  fetchNotification,
  getApplication,
  getCloudApiEnvironment,
  getCurrentDevice,
  isReady,
  logNotificationOpen,
  NotificareApplicationUnavailableError,
  NotificareDeviceUnavailableError,
  NotificareNotification,
  NotificareNotReadyError,
  NotificareServiceUnavailableError,
} from '@notificare/web-core';
import { convertCloudInboxItemToPublic } from './internal/cloud-api/inbox-converter';
import { notifyInboxUpdated } from './internal/consumer-events';
import { refreshBadgeInternal } from './internal/internal-api';
import { logger } from './logger';
import { NotificareInboxItem } from './models/notificare-inbox-item';
import { NotificareInboxResponse } from './models/notificare-inbox-response';

export {
  onInboxUpdated,
  onBadgeUpdated,
  OnInboxUpdatedCallback,
  OnBadgeUpdatedCallback,
} from './internal/consumer-events';

/**
 * @returns {number} - The current badge count, representing the number of unread inbox items.
 */
export function getBadge(): number {
  const application = getApplication();
  if (!application) {
    logger.warning('Notificare application is not yet available.');
    return 0;
  }

  if (!application.inboxConfig?.useInbox) {
    logger.warning('Notificare inbox functionality is not enabled.');
    return 0;
  }

  if (!application.inboxConfig?.autoBadge) {
    logger.warning('Notificare auto badge functionality is not enabled.');
    return 0;
  }

  const badgeStr = localStorage.getItem('re.notifica.inbox.badge');
  if (!badgeStr) return 0;

  return parseInt(badgeStr, 10);
}

/**
 * Fetches the current inbox, returning all the inbox items, inbox count and unread count.
 *
 * @param {FetchInboxOptions} options - An {@link FetchInboxOptions} object with the inbox fetching
 * options.
 * @returns {Promise<NotificareInboxResponse>} - A promise that resolves to a
 * {@link NotificareInboxResponse} object containing all the inbox items, inbox count and unread count.
 */
export async function fetchInbox(options?: FetchInboxOptions): Promise<NotificareInboxResponse> {
  checkPrerequisites();

  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  const { inboxItems, count, unread } = await fetchCloudDeviceInbox({
    environment: getCloudApiEnvironment(),
    deviceId: device.id,
    skip: options?.skip ?? 0,
    limit: options?.limit ?? 100,
    since: options?.since,
  });

  const now = Date.now();
  const items = inboxItems
    .filter(({ visible, expires }) => visible && (!expires || Date.parse(expires) > now))
    .map(convertCloudInboxItemToPublic);

  return {
    items,
    count,
    unread,
  };
}

/**
 * Refreshes the badge count reflecting the number of unread inbox items.
 *
 * @returns {Promise<number>} - A promise that resolves to a number  of unread inbox items.
 */
export async function refreshBadge(): Promise<number> {
  checkPrerequisites();

  return refreshBadgeInternal();
}

/**
 * Opens a specified inbox item, marking it as read and returning the associated notification.
 *
 * @param {NotificareInboxItem} item - The {@link NotificareInboxItem} to open.
 * @return {Promise<NotificareNotification>} - The {@link NotificareNotification} associated with
 * the inbox item.
 */
export async function openInboxItem(item: NotificareInboxItem): Promise<NotificareNotification> {
  checkPrerequisites();

  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  let { notification } = item;
  if (item.notification.partial) {
    notification = await fetchNotification(item.id);
  }

  await markInboxItemAsRead(item);

  if (!item.opened) {
    notifyInboxUpdated();
  }

  return notification;
}

/**
 * Marks the specified inbox item as read.
 *
 * @param {NotificareInboxItem} item - The {@link NotificareInboxItem} to mark as read.
 * @returns {Promise<void>} - A promise that resolves when the inbox item has
 * been successfully marked as read.
 */
export async function markInboxItemAsRead(item: NotificareInboxItem): Promise<void> {
  checkPrerequisites();

  await logNotificationOpen(item.notification.id);
  await refreshBadge();
}

/**
 * Marks all inbox items as read.
 *
 * @returns {Promise<void>} - A promise that resolves when all inbox items
 * have been successfully marked as read.
 */
export async function markAllInboxItemsAsRead(): Promise<void> {
  checkPrerequisites();

  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  await markCloudDeviceInboxAsRead({
    environment: getCloudApiEnvironment(),
    deviceId: device.id,
  });

  await refreshBadge();
}

/**
 * Permanently removes the specified inbox item from the inbox.
 *
 * @param {NotificareInboxItem} item - The {@link NotificareInboxItem} to remove.
 * @returns {Promise<void>} - A promise that resolves when the inbox item has
 * been successfully removed.
 */
export async function removeInboxItem(item: NotificareInboxItem): Promise<void> {
  checkPrerequisites();

  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  await removeCloudDeviceInboxItem({
    environment: getCloudApiEnvironment(),
    id: item.id,
  });

  await refreshBadge();
}

/**
 * Clears all inbox items, permanently deleting them from the inbox.
 *
 * @returns {Promise<void>} - A promise that resolves when all inbox items
 * have been successfully cleared.
 */
export async function clearInbox(): Promise<void> {
  checkPrerequisites();

  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  await clearCloudDeviceInbox({
    environment: getCloudApiEnvironment(),
    deviceId: device.id,
  });

  await refreshBadge();
}

function checkPrerequisites() {
  if (!isReady()) {
    logger.warning('Notificare is not ready yet.');
    throw new NotificareNotReadyError();
  }

  const application = getApplication();
  if (!application) {
    logger.warning('Notificare application is not yet available.');
    throw new NotificareApplicationUnavailableError();
  }

  if (!application.services.inbox) {
    logger.warning('Notificare inbox functionality is not enabled.');
    throw new NotificareServiceUnavailableError('inbox');
  }

  if (!application.inboxConfig?.useInbox) {
    logger.warning('Notificare inbox functionality is not enabled.');
    throw new NotificareServiceUnavailableError('inbox');
  }
}

interface FetchInboxOptions {
  since?: string;
  skip?: number;
  limit?: number;
}
