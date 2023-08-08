import {
  getApplication,
  getCurrentDevice,
  getOptions,
  isConfigured,
  NotificareApplication,
  NotificareDeviceUnavailableError,
  NotificareNotConfiguredError,
  NotificareNotReadyError,
  NotificareWebsitePushConfigLaunchConfigAutoOnboardingOptions,
  NotificareWebsitePushConfigLaunchConfigFloatingButtonOptions,
  registerPushDevice,
  registerTemporaryDevice,
  request,
} from '@notificare/core';
import { logger } from '../logger';
import { sleep } from './utils';
import { showOnboarding } from './ui/onboarding';
import { showFloatingButton } from './ui/floating-button';
import { getPushPermissionStatus } from './utils/push';
import {
  disableWebPushNotifications,
  enableWebPushNotifications,
  hasWebPushSupport,
  postMessageToServiceWorker,
} from './internal-api-web-push';
import { enableSafariPushNotifications, hasSafariPushSupport } from './internal-api-safari-push';
import { setRemoteNotificationsEnabled } from './storage/local-storage';
import { logPushRegistration } from './internal-api-events';

export function hasWebPushCapabilities(): boolean {
  return hasWebPushSupport() || hasSafariPushSupport();
}

export async function enableRemoteNotifications(): Promise<void> {
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
  } else if (hasSafariPushSupport()) {
    const token = await enableSafariPushNotifications();

    await registerPushDevice({
      transport: 'WebsitePush',
      token,
    });
  }

  setRemoteNotificationsEnabled(true);

  try {
    await updateNotificationSettings();
  } catch (e) {
    logger.warning('Unable to update the notification settings.', e);
  }
}

export async function disableRemoteNotifications(): Promise<void> {
  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  if (device.transport === 'WebPush') {
    await disableWebPushNotifications();
  }

  await registerTemporaryDevice();

  setRemoteNotificationsEnabled(false);
}

export async function handleAutoOnboarding(
  application: NotificareApplication,
  autoOnboardingOptions: NotificareWebsitePushConfigLaunchConfigAutoOnboardingOptions,
) {
  const permission = getPushPermissionStatus();

  if (permission === 'denied') {
    logger.info('The user denied remote notifications.');
    return;
  }

  if (permission === 'granted') return;

  const retryAfterMillis = (autoOnboardingOptions.retryAfterHours ?? 24) * 60 * 60 * 1000;
  const lastAttemptMillis = getOnboardingLastAttempt();

  const canShowOnboarding = !lastAttemptMillis || lastAttemptMillis + retryAfterMillis < Date.now();
  if (!canShowOnboarding) return;

  if (autoOnboardingOptions.showAfterSeconds) {
    await sleep(autoOnboardingOptions.showAfterSeconds * 1000);
  }

  showOnboarding({
    application,
    autoOnboardingOptions,
    onAcceptClicked: () => {
      localStorage.removeItem('re.notifica.push.onboarding_last_attempt');
      enableRemoteNotifications()
        .then(() => logger.debug('Remote notifications enabled.'))
        .catch((e) => logger.error(`Failed to enable remote notifications: ${e}`));
    },
    onCancelClicked: () => {
      localStorage.setItem('re.notifica.push.onboarding_last_attempt', Date.now().toString());
    },
  });
}

export async function handleFloatingButton(
  application: NotificareApplication,
  options: NotificareWebsitePushConfigLaunchConfigFloatingButtonOptions,
) {
  showFloatingButton({
    options,
    onButtonClicked: () => {
      if (getPushPermissionStatus() === 'granted') return;

      enableRemoteNotifications()
        .then(() => logger.debug('Remote notifications enabled.'))
        .catch((e) => logger.error(`Failed to enable remote notifications: ${e}`));
    },
  });
}

function getOnboardingLastAttempt(): number | undefined {
  const lastAttemptStr = localStorage.getItem('re.notifica.push.onboarding_last_attempt');
  if (!lastAttemptStr) return undefined;

  return parseInt(lastAttemptStr, 10);
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
