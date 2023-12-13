import { getApplication } from '@notificare/web-core';
import { hasSafariPushSupport } from '../internal/internal-api-safari-push';
import { hasWebPushSupport } from '../internal/internal-api-web-push';

export type NotificarePushPermissionStatus = 'default' | 'granted' | 'denied';

export function getPushPermissionStatus(): NotificarePushPermissionStatus {
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
