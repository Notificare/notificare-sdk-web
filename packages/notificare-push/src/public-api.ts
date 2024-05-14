import {
  getApplication,
  isReady,
  NotificareApplicationUnavailableError,
  NotificareNotReadyError,
  NotificareServiceUnavailableError,
} from '@notificare/web-core';
import {
  disableRemoteNotifications as disableRemoteNotificationsInternal,
  enableRemoteNotifications as enableRemoteNotificationsInternal,
} from './internal/internal-api';
import { getRemoteNotificationsEnabled, retrieveAllowedUI } from './internal/storage/local-storage';
import { logger } from './logger';

export {
  onNotificationSettingsChanged,
  onNotificationReceived,
  onNotificationOpened,
  onNotificationActionOpened,
  onSystemNotificationReceived,
  onUnknownNotificationReceived,
  OnNotificationSettingsChangedCallback,
  OnNotificationReceivedCallback,
  OnSystemNotificationReceivedCallback,
  OnNotificationActionOpenedCallback,
  OnNotificationOpenedCallback,
  OnUnknownNotificationReceivedCallback,
} from './internal/consumer-events';

export { hasWebPushCapabilities } from './internal/internal-api';

export function hasRemoteNotificationsEnabled(): boolean {
  return getRemoteNotificationsEnabled() ?? false;
}

export function getAllowedUI(): boolean {
  return retrieveAllowedUI() ?? false;
}

export async function enableRemoteNotifications(): Promise<void> {
  checkPrerequisites();
  await enableRemoteNotificationsInternal();
}

export async function disableRemoteNotifications(): Promise<void> {
  checkPrerequisites();
  await disableRemoteNotificationsInternal();
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

  if (!application.services.websitePush) {
    logger.warning('Notificare website push functionality is not enabled.');
    throw new NotificareServiceUnavailableError('websitePush');
  }
}
