import {
  getApplication,
  getCurrentDevice,
  NotificareApplicationUnavailableError,
  NotificareDeviceUnavailableError,
  request,
} from '@notificare/web-core';
import { logger } from '../logger';
import { NotificareAutoBadgeUnavailableError } from '../errors/notificare-auto-badge-unavailable-error';
import { NetworkInboxResponse } from './network/responses/inbox-response';
import { notifyBadgeUpdated } from './consumer-events';

export async function refreshBadgeInternal(): Promise<number> {
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

  notifyBadgeUpdated(unread);

  return unread;
}

export async function clearInboxInternal() {
  await clearRemoteInbox();
  clearLocalBadge();
}

export async function clearRemoteInbox(): Promise<void> {
  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  await request(`/api/notification/inbox/fordevice/${encodeURIComponent(device.id)}`, {
    method: 'DELETE',
  });
}

function clearLocalBadge() {
  localStorage.removeItem('re.notifica.inbox.badge');
}
