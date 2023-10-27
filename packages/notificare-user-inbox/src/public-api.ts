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
  fetchCloudUserInboxNotification,
  removeCloudUserInboxItem,
} from '@notificare/web-cloud-api';
import { logger } from './logger';
import { NotificareUserInboxResponse } from './models/notificare-user-inbox-response';
import { NotificareUserInboxItem } from './models/notificare-user-inbox-item';
import {
  convertNetworkUserInboxItemToPublic,
  NetworkUserInboxResponse,
} from './internal/network/responses/user-inbox-response';

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

export async function markInboxItemAsRead(item: NotificareUserInboxItem): Promise<void> {
  checkPrerequisites();

  await logNotificationOpen(item.notification.id);
}

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
