import {
  getApplication,
  getCurrentDevice,
  isReady,
  NotificareApplicationUnavailableError,
  NotificareDeviceUnavailableError,
  NotificareNotReadyError,
  NotificareServiceUnavailableError,
  request,
  logNotificationOpen,
  NotificareNotification,
  fetchNotification,
} from '@notificare/core';
import { logger } from './logger';
import {
  convertNetworkInboxItemToPublic,
  NetworkInboxResponse,
} from './internal/network/responses/inbox-response';
import { NotificareInboxResponse } from './models/notificare-inbox-response';
import { NotificareInboxItem } from './models/notificare-inbox-item';
import { NotificareAutoBadgeUnavailableError } from './errors/notificare-auto-badge-unavailable-error';

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

  const queryParameters = new URLSearchParams({
    skip: options?.skip?.toString() ?? '0',
    limit: options?.limit?.toString() ?? '100',
  });

  if (options?.since) queryParameters.set('since', options.since);

  const response = await request(
    `/api/notification/inbox/fordevice/${encodeURIComponent(device.id)}?${queryParameters}`,
  );

  const { inboxItems, count, unread }: NetworkInboxResponse = await response.json();

  return {
    items: inboxItems.map(convertNetworkInboxItemToPublic),
    count,
    unread,
  };
}

export async function refreshBadge(): Promise<number> {
  checkPrerequisites();

  const application = getApplication();
  if (!application) throw new NotificareApplicationUnavailableError();

  if (!application.inboxConfig?.autoBadge) {
    logger.warning('Notificare auto badge functionality is not enabled.');
    throw new NotificareAutoBadgeUnavailableError();
  }

  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  const queryParameters = new URLSearchParams({
    skip: '0',
    limit: '1',
  });

  const response = await request(
    `/api/notification/inbox/fordevice/${encodeURIComponent(device.id)}?${queryParameters}`,
  );

  const { unread }: NetworkInboxResponse = await response.json();

  localStorage.setItem('re.notifica.inbox.badge', unread.toString());

  if (navigator.setAppBadge) navigator.setAppBadge(unread);
  if (navigator.setClientBadge) navigator.setClientBadge(unread);

  return unread;
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

  await request(`/api/notification/inbox/fordevice/${encodeURIComponent(device.id)}`, {
    method: 'PUT',
  });

  await refreshBadge();
}

export async function removeInboxItem(item: NotificareInboxItem): Promise<void> {
  checkPrerequisites();

  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  await request(`/api/notification/inbox/${encodeURIComponent(item.id)}`, {
    method: 'DELETE',
  });

  await refreshBadge();
}

export async function clearInbox(): Promise<void> {
  checkPrerequisites();

  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  await request(`/api/notification/inbox/fordevice/${encodeURIComponent(device.id)}`, {
    method: 'DELETE',
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
