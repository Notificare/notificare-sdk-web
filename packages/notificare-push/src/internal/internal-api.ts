import { updateCloudDevice } from '@notificare/web-cloud-api';
import {
  deleteDevice,
  getApplication,
  getCloudApiEnvironment,
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
} from '@notificare/web-core';
import { logger } from '../logger';
import { getPushPermissionStatus } from '../utils/push';
import { notifyNotificationSettingsChanged } from './consumer-events';
import { logPushRegistration } from './internal-api-events';
import { enableSafariPushNotifications, hasSafariPushSupport } from './internal-api-safari-push';
import {
  disableWebPushNotifications,
  enableWebPushNotifications,
  hasWebPushSupport,
  postMessageToServiceWorker,
} from './internal-api-web-push';
import {
  getRemoteNotificationsEnabled,
  retrieveAllowedUI,
  setRemoteNotificationsEnabled,
  storeAllowedUI,
} from './storage/local-storage';
import { showFloatingButton } from './ui/floating-button';
import { showOnboarding } from './ui/onboarding';
import { sleep } from './utils';
import { transaction } from './utils/transaction';

let ongoingPushRegistration = false;

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

  if (ongoingPushRegistration) {
    throw new Error('Cannot process multiple registration at the same time.');
  }

  setRemoteNotificationsEnabled(true);

  try {
    ongoingPushRegistration = true;

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
  } finally {
    ongoingPushRegistration = false;
  }

  try {
    await updateNotificationSettings();
  } catch (e) {
    logger.warning('Unable to update the notification settings.', e);
  }
}

export async function disableRemoteNotifications(): Promise<void> {
  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  await transaction({
    originalValue: getRemoteNotificationsEnabled(),
    restoreValue: setRemoteNotificationsEnabled,
    fn: async () => {
      setRemoteNotificationsEnabled(false);

      if (device.transport === 'WebPush') {
        await disableWebPushNotifications();
      }

      const options = getOptions();
      if (options?.ignoreTemporaryDevices) {
        await deleteDevice();
      } else {
        await registerTemporaryDevice();
      }

      storeAllowedUI(false);
      notifyNotificationSettingsChanged(false);
    },
  });
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

  const device = getCurrentDevice();
  if (device && device.transport !== 'Notificare' && permission === 'granted') return;

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
      localStorage.setItem('re.notifica.push.onboarding_last_attempt', Date.now().toString());

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

  const granted = getPushPermissionStatus() === 'granted';
  const allowedUI = device.transport !== 'Notificare' && granted;

  if (retrieveAllowedUI() !== allowedUI) {
    await updateCloudDevice({
      environment: getCloudApiEnvironment(),
      deviceId: device.id,
      payload: {
        allowedUI,
        webPushCapable: hasWebPushCapabilities(),
      },
    });

    storeAllowedUI(allowedUI);
    notifyNotificationSettingsChanged(allowedUI);

    logger.debug('User notification settings updated.');
  } else {
    logger.debug('User notification settings update skipped, nothing changed.');
  }

  const firstRegistrationStr = localStorage.getItem('re.notifica.push.first_registration');
  const firstRegistration = firstRegistrationStr == null || firstRegistrationStr === 'true';

  if (allowedUI && firstRegistration) {
    await logPushRegistration();
    localStorage.setItem('re.notifica.push.first_registration', 'false');
  }
}

export async function monitorPushPermissionChanges() {
  if (!('permissions' in navigator)) {
    throw new Error('The current browser does not supporting the permission status.');
  }

  const permissionStatus = await navigator.permissions.query({ name: 'notifications' });
  permissionStatus.onchange = () => {
    if (!getRemoteNotificationsEnabled() || ongoingPushRegistration) return;

    const device = getCurrentDevice();
    const hasPushPermission = getPushPermissionStatus() === 'granted';
    const canRegisterPushDevice = !device || device.transport === 'Notificare';

    if (hasPushPermission && canRegisterPushDevice) {
      logger.debug('Enabling remote notifications due to a permission status change.');
      enableRemoteNotifications().catch((e) =>
        logger.warning('Failed to enable remote notifications.', e),
      );

      return;
    }

    logger.debug('Updating notification settings due to a permission status change.');
    updateNotificationSettings().catch((e) =>
      logger.warning('Unable to update the notification settings.', e),
    );
  };
}
