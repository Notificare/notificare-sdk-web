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
import {
  getRemoteNotificationsEnabled,
  retrieveAllowedUI,
  retrieveSubscription,
  retrieveTransport,
} from './internal/storage/local-storage';
import { logger } from './logger';
import { NotificarePushSubscription } from './models/notificare-push-subscription';
import { NotificareTransport } from './models/notificare-transport';

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

/**
 * Indicates whether remote notifications are enabled.
 *
 * @returns {boolean} - `true` if remote notifications are enabled for the application, and `false`
 * otherwise.
 */
export function hasRemoteNotificationsEnabled(): boolean {
  return getRemoteNotificationsEnabled() ?? false;
}

/**
 * Indicates whether the device is capable of receiving remote notifications.
 *
 * This property returns `true` if the user has granted permission to receive push notifications and
 * the device has successfully obtained a push token from the notification service. It reflects
 * whether the app can present notifications as allowed by the system and user settings.
 *
 * @returns {boolean} - `true` if the device can receive remote notifications, `false` otherwise.
 */
export function getAllowedUI(): boolean {
  return retrieveAllowedUI() ?? false;
}

/**
 * Provides the current push transport information.
 *
 * @returns {NotificareTransport | undefined} - The {@link NotificareTransport} assigned to the
 * device,  or `undefined` if no transport
 * has been set.
 */
export function getTransport(): NotificareTransport | undefined {
  return retrieveTransport();
}

/**
 * Provides the current push subscription token.
 *
 * @returns {NotificarePushSubscription | undefined} - The device's current
 * {@link NotificarePushSubscription}, or `undefined` if no {@link NotificarePushSubscription}
 * is available.
 */
export function getSubscription(): NotificarePushSubscription | undefined {
  return retrieveSubscription();
}

/**
 * Enables remote notifications.
 *
 * This function enables remote notifications for the application, allowing push notifications to be
 * received.
 *
 * @returns {Promise<void>} - A promise that resolves when remote notifications
 * have been successfully enabled.
 */
export async function enableRemoteNotifications(): Promise<void> {
  checkPrerequisites();
  await enableRemoteNotificationsInternal();
}

/**
 * Disables remote notifications.
 *
 * This function disables remote notifications for the application, preventing push notifications
 * from being received.
 *
 * @returns {Promise<void>} - A promise that resolves when remote notifications
 * have been successfully disabled.
 */
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
