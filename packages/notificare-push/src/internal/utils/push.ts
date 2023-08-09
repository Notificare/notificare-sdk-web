import { getApplication } from '@notificare/web-core';
import { hasWebPushSupport } from '../internal-api-web-push';
import { hasSafariPushSupport } from '../internal-api-safari-push';

export type NotificareWebPushPermissionStatus = 'default' | 'granted' | 'denied';

export function getPushPermissionStatus(): NotificareWebPushPermissionStatus {
  if (hasWebPushSupport()) {
    return Notification.permission;
  }

  const application = getApplication();
  if (
    hasSafariPushSupport() &&
    window.safari &&
    application?.websitePushConfig?.info?.subject.UID
  ) {
    const { permission } = window.safari.pushNotification.permission(
      application.websitePushConfig.info.subject.UID,
    );

    return permission;
  }

  return 'default';
}
