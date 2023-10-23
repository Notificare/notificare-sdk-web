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
import {
  clearCloudDeviceInbox,
  fetchCloudDeviceInbox,
  markCloudDeviceInboxAsRead,
  removeCloudDeviceInboxItem,
} from '@notificare/web-cloud-api';
import { logger } from './logger';
import { NotificareInboxResponse } from './models/notificare-inbox-response';
import { NotificareInboxItem } from './models/notificare-inbox-item';
import { refreshBadgeInternal } from './internal/internal-api';
import { notifyInboxUpdated } from './internal/consumer-events';
import { convertCloudInboxItemToPublic } from './internal/cloud-api/inbox-converter';

export { onInboxUpdated, onBadgeUpdated } from './internal/consumer-events';

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

  return {
    items: inboxItems.map(convertCloudInboxItemToPublic),
    count,
    unread,
  };
}

export async function refreshBadge(): Promise<number> {
  checkPrerequisites();

  return refreshBadgeInternal();
}

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

export async function markInboxItemAsRead(item: NotificareInboxItem): Promise<void> {
  checkPrerequisites();

  await logNotificationOpen(item.notification.id);
  await refreshBadge();
}

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
