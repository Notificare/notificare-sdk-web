import {
  getApplication,
  getOptions,
  NotificareNotConfiguredError,
  NotificareNotReadyError,
  registerPushDevice,
} from '@notificare/core';
import { logger } from './logger';
import { enableWebPushNotifications, hasWebPushSupport } from './internal/internal-api-web-push';
import {
  enableSafariPushNotifications,
  hasSafariPushSupport,
} from './internal/internal-api-safari-push';
import { updateNotificationSettings } from './internal/internal-api-push';

export { hasWebPushCapabilities } from './internal/internal-api-push';

export async function enableRemoteNotifications(): Promise<void> {
  // TODO: check prerequisites

  const options = getOptions();
  if (!options) throw new NotificareNotConfiguredError();

  const application = getApplication();
  if (!application) throw new NotificareNotReadyError();

  if (!application.webPushConfig?.icon) {
    throw new Error(
      'Missing application icon. Please check your Website Push configurations in our dashboard before proceeding.',
    );
  }

  if (application.webPushConfig.allowedDomains.indexOf(options.applicationHost) === -1) {
    throw new Error(
      'Missing allowed domain. Please check your Website Push configurations in our dashboard before proceeding.',
    );
  }

  if (!hasWebPushSupport() && !hasSafariPushSupport()) {
    throw new Error('Your browser does not support Service Workers nor Safari Website Push.');
  }

  if (hasWebPushSupport()) {
    const token = await enableWebPushNotifications(application, options);

    await registerPushDevice({
      transport: 'WebPush',
      token: token.endpoint,
      keys: token.keys,
    });
  }

  if (hasSafariPushSupport()) {
    await enableSafariPushNotifications();
  }

  try {
    await updateNotificationSettings();
  } catch (e) {
    logger.warning('Unable to update the notification settings.', e);
  }
}
