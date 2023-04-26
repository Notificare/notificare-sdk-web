import {
  getApplication,
  getOptions,
  NotificareApplicationUnavailableError,
  NotificareNotConfiguredError,
} from '@notificare/core';
import { requestSafariPermission } from './utils/safari-push';

export function hasSafariPushSupport(): boolean {
  return window.safari?.pushNotification != null;
}

export async function enableSafariPushNotifications(): Promise<string> {
  const application = getApplication();
  if (!application) throw new NotificareApplicationUnavailableError();

  const options = getOptions();
  if (!options) throw new NotificareNotConfiguredError();

  const uid = application.websitePushConfig?.info?.subject?.UID;
  if (!uid) {
    throw new Error(
      'Missing Safari Website Push configuration. Please check your Website Push configurations in our dashboard before proceeding.',
    );
  }

  if (!window.safari) {
    throw new Error('Your browser does not support Safari Website Push.');
  }

  const currentPermission = window.safari.pushNotification.permission(uid);
  const currentDeviceToken = checkSafariRemoteNotificationPermission(currentPermission);
  if (currentDeviceToken) return currentDeviceToken;

  const permission = await requestSafariPermission(options.services.websitePushHost, uid, {
    applicationKey: options.applicationKey,
  });

  const deviceToken = checkSafariRemoteNotificationPermission(permission);
  if (!deviceToken) throw new Error('Safari device token unavailable upon requesting permission.');

  return deviceToken;
}

export async function disableWebPushNotifications() {
  //
}

function checkSafariRemoteNotificationPermission({
  permission,
  deviceToken,
}: SafariRemoteNotificationPermission): string | undefined {
  switch (permission) {
    case 'default':
      return undefined;

    case 'granted':
      if (!deviceToken) throw new Error('Safari device token unavailable.');
      return deviceToken;

    case 'denied':
      throw new Error('Safari Website Push permission denied.');

    default:
      throw new Error(`Unhandled safari permission (${permission}).`);
  }
}
