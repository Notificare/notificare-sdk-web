import {
  fetchCloudUserInboxNotification,
  removeCloudUserInboxItem,
} from '@notificare/web-cloud-api';
import {
  getApplication,
  getCloudApiEnvironment,
  getCurrentDevice,
  isConfigured,
  isReady,
  logNotificationOpen,
  NotificareApplicationUnavailableError,
  NotificareDeviceUnavailableError,
  NotificareNotConfiguredError,
  NotificareNotification,
  NotificareNotReadyError,
  NotificareServiceUnavailableError,
  convertCloudNotificationToPublic,
} from '@notificare/web-core';
import {
  convertNetworkUserInboxItemToPublic,
  NetworkUserInboxResponse,
} from './internal/network/responses/user-inbox-response';
import { logger } from './logger';
import { NotificareUserInboxItem } from './models/notificare-user-inbox-item';
import { NotificareUserInboxResponse } from './models/notificare-user-inbox-response';

/**
 * Parses a {@link NetworkUserInboxResponse} object to produce a {@link NotificareUserInboxItem}.
 *
 * This method takes a {@link NetworkUserInboxResponse} and converts it into a structured
 * {@link NotificareUserInboxItem}.
 *
 * @param {NotificareUserInboxResponse} response - The {@link NetworkUserInboxResponse} representing
 * the user inbox response.
 * @return {Promise<NotificareUserInboxResponse>} - A promise that resolves to a
 * {@link NotificareUserInboxItem} object parsed from the provided {@link NetworkUserInboxResponse}.
 */
export async function parseInboxResponse(
  response: NetworkUserInboxResponse,
): Promise<NotificareUserInboxResponse> {
  checkPrerequisites();

  if (!response.count) throw new Error("Missing 'count' parameter.");
  if (!response.unread) throw new Error("Missing 'unread' parameter.");
  if (!response.inboxItems) throw new Error("Missing 'items' parameter.");

  return {
    items: response.inboxItems.map(convertNetworkUserInboxItemToPublic),
    count: response.count,
    unread: response.unread,
  };
}

/**
 * Opens an inbox item and retrieves its associated notification.
 *
 * This function opens the provided {@link NotificareUserInboxItem} and returns the associated
 * {@link NotificareNotification}. This operation marks the item as read.
 *
 * @param {NotificareUserInboxItem} item - The {@link NotificareUserInboxItem} to be opened.
 * @return {Promise<NotificareNotification>} - A promise that resolves to a
 * {@link NotificareNotification} associated with the opened inbox item.
 */
export async function openInboxItem(
  item: NotificareUserInboxItem,
): Promise<NotificareNotification> {
  checkPrerequisites();

  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  // User inbox items are always partial.
  const notification = await fetchUserInboxNotification(item);

  await markInboxItemAsRead(item);

  return notification;
}

/**
 * Marks an inbox item as read.
 *
 * This function updates the status of the provided {@link NotificareUserInboxItem} to read.
 *
 * @param {NotificareUserInboxItem} item - The {@link NotificareUserInboxItem} to mark as read.
 * @returns {Promise<void>} - A promise that resolves when the inbox item has
 * been successfully marked as read.
 */
export async function markInboxItemAsRead(item: NotificareUserInboxItem): Promise<void> {
  checkPrerequisites();

  await logNotificationOpen(item.notification.id);
}

/**
 * Removes an inbox item from the user's inbox.
 *
 * This function deletes the provided {@link NotificareUserInboxItem} from the user's inbox.
 *
 * @param {NotificareUserInboxItem} item - The {@link NotificareUserInboxItem} to be removed.
 * @returns {Promise<void>} - A promise that resolves when the inbox item has
 * been successfully removed.
 */
export async function removeInboxItem(item: NotificareUserInboxItem): Promise<void> {
  checkPrerequisites();

  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  await removeCloudUserInboxItem({
    environment: getCloudApiEnvironment(),
    deviceId: device.id,
    id: item.id,
  });
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

  if (!application.inboxConfig?.useUserInbox) {
    logger.warning('Notificare user inbox functionality is not enabled.');
    throw new NotificareServiceUnavailableError('inbox');
  }
}

async function fetchUserInboxNotification(
  item: NotificareUserInboxItem,
): Promise<NotificareNotification> {
  if (!isConfigured()) throw new NotificareNotConfiguredError();

  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  const { notification } = await fetchCloudUserInboxNotification({
    environment: getCloudApiEnvironment(),
    deviceId: device.id,
    id: item.id,
  });

  return convertCloudNotificationToPublic(notification);
}
