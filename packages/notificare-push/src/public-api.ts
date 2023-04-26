import {
  getApplication,
  getCurrentDevice,
  getOptions,
  isConfigured,
  NotificareDeviceUnavailableError,
  NotificareNotConfiguredError,
  NotificareNotReadyError,
  registerPushDevice,
  registerTemporaryDevice,
  request,
} from '@notificare/core';
import { logger } from './logger';
import {
  disableWebPushNotifications,
  enableWebPushNotifications,
  hasWebPushSupport,
  postMessageToServiceWorker,
} from './internal/internal-api-web-push';
import {
  enableSafariPushNotifications,
  hasSafariPushSupport,
} from './internal/internal-api-safari-push';
import { logPushRegistration } from './internal/internal-api-events';

export {
  onNotificationReceived,
  onNotificationOpened,
  onNotificationActionOpened,
  onSystemNotificationReceived,
  onUnknownNotificationReceived,
} from './internal/consumer-events';

export function hasWebPushCapabilities(): boolean {
  return hasWebPushSupport() || hasSafariPushSupport();
}

export async function enableRemoteNotifications(): Promise<void> {
  // TODO: check prerequisites

  const options = getOptions();
  if (!options) throw new NotificareNotConfiguredError();

  const application = getApplication();
  if (!application) throw new NotificareNotReadyError();

  if (!application.websitePushConfig?.icon) {
    throw new Error(
      'Missing application icon. Please check your Website Push configurations in our dashboard before proceeding.',
    );
  }

  if (application.websitePushConfig.allowedDomains.indexOf(options.applicationHost) === -1) {
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

    try {
      await postMessageToServiceWorker({
        action: 're.notifica.ready',
      });
    } catch (e) {
      logger.warning('Failed to send a message to the service worker.', e);
    }
  }

  if (hasSafariPushSupport()) {
    const token = await enableSafariPushNotifications();

    await registerPushDevice({
      transport: 'WebsitePush',
      token,
    });
  }

  try {
    await updateNotificationSettings();
  } catch (e) {
    logger.warning('Unable to update the notification settings.', e);
  }
}

export async function disableRemoteNotifications(): Promise<void> {
  // TODO: check prerequisites

  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  if (device.transport === 'WebPush') {
    await disableWebPushNotifications();
  }

  await registerTemporaryDevice();
}

async function updateNotificationSettings() {
  if (!isConfigured()) throw new NotificareNotConfiguredError();

  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  const allowedUI = device.transport !== 'Notificare' && hasWebPushCapabilities();

  await request(`/api/device/${encodeURIComponent(device.id)}`, {
    method: 'PUT',
    body: {
      allowedUI,
      webPushCapable: hasWebPushCapabilities(),
    },
  });

  const firstRegistrationStr = localStorage.getItem('re.notifica.push.first_registration');
  const firstRegistration = firstRegistrationStr == null || firstRegistrationStr === 'true';

  if (allowedUI && firstRegistration) {
    await logPushRegistration();
    localStorage.setItem('re.notifica.push.first_registration', 'false');
  }
}
