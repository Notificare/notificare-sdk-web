import {
  getApplication,
  getCloudApiEnvironment,
  getCurrentDevice,
  NotificareApplicationUnavailableError,
  NotificareDeviceUnavailableError,
} from '@notificare/web-core';
import { clearCloudDeviceInbox, fetchCloudDeviceInbox } from '@notificare/web-cloud-api';
import { logger } from '../logger';
import { NotificareAutoBadgeUnavailableError } from '../errors/notificare-auto-badge-unavailable-error';
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

  const { unread } = await fetchCloudDeviceInbox({
    environment: getCloudApiEnvironment(),
    deviceId: device.id,
    skip: 0,
    limit: 1,
  });

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

  await clearCloudDeviceInbox({
    environment: getCloudApiEnvironment(),
    deviceId: device.id,
  });
}

function clearLocalBadge() {
  localStorage.removeItem('re.notifica.inbox.badge');
}
