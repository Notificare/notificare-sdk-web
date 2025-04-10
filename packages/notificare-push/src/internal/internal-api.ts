import { updateCloudDevice } from '@notificare/web-cloud-api';
import {
  executeComponentCommand,
  getApplication,
  getCloudApiEnvironment,
  getCurrentDevice,
  getOptions,
  isConfigured,
  NotificareApplication,
  NotificareApplicationUnavailableError,
  NotificareDeviceUnavailableError,
  NotificareNotConfiguredError,
  NotificareWebsitePushConfigLaunchConfigAutoOnboardingOptions,
  NotificareWebsitePushConfigLaunchConfigFloatingButtonOptions,
} from '@notificare/web-core';
import { logger } from '../logger';
import { NotificarePushSubscription } from '../models/notificare-push-subscription';
import { NotificareTransport } from '../models/notificare-transport';
import { getPushPermissionStatus } from '../utils/push';
import { notifyNotificationSettingsChanged, notifySubscriptionChanged } from './consumer-events';
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
  retrieveSubscription,
  retrieveTransport,
  setRemoteNotificationsEnabled,
  storeAllowedUI,
  storeSubscription,
  storeTransport,
} from './storage/local-storage';
import { showFloatingButton } from './ui/floating-button';
import { showOnboarding } from './ui/onboarding';
import { sleep } from './utils';
import { transaction } from './utils/transaction';

let ongoingPushRegistration = false;

/**
 * Indicates whether the current environment supports web push notifications.
 *
 * @returns {boolean} - `true` if the current environment supports web push notifications, `false`
 * if not.
 */
export function hasWebPushCapabilities(): boolean {
  return hasWebPushSupport() || hasSafariPushSupport();
}

export async function enableRemoteNotifications(): Promise<void> {
  const options = getOptions();
  if (!options) throw new NotificareNotConfiguredError();

  const application = getApplication();
  if (!application) throw new NotificareApplicationUnavailableError();

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

    const device = getCurrentDevice();

    if (hasWebPushSupport()) {
      let token = await enableWebPushNotifications(application, options);

      if (!device && options.ignoreTemporaryDevices) {
        await executeComponentCommand({
          component: 'device',
          command: 'createDevice',
        });

        // The first service worker registration won't register with a deviceId when ignoreTemporaryDevices
        // is enabled, since there is no device at that point. We must re-register the service worker with
        // the updated configuration to pass along the latest device identifier.
        logger.debug('Updating service worker with the latest device identifier.');
        token = await enableWebPushNotifications(application, options);
      }

      await updateDeviceSubscription({
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

      if (!device && options.ignoreTemporaryDevices) {
        await executeComponentCommand({
          component: 'device',
          command: 'createDevice',
        });
      }

      await updateDeviceSubscription({
        transport: 'WebsitePush',
        token,
      });
    }
  } finally {
    ongoingPushRegistration = false;
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

      const transport = retrieveTransport();
      if (transport === 'WebPush') {
        await disableWebPushNotifications();
      }

      await updateDeviceSubscription({ transport: 'Notificare' });
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

  const transport = retrieveTransport();
  if (transport && transport !== 'Notificare' && permission === 'granted') return;

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

async function updateDeviceSubscription({
  transport,
  token,
  keys,
}: {
  transport: NotificareTransport;
  token?: string;
  keys?: object;
}) {
  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  const options = getOptions();

  if (transport === 'Notificare' && options?.ignoreTemporaryDevices) {
    await executeComponentCommand({
      component: 'device',
      command: 'deleteDevice',
    });

    storeTransport(undefined);

    storeSubscription(undefined);
    notifySubscriptionChanged(undefined);

    storeAllowedUI(false);
    notifyNotificationSettingsChanged(false);

    return;
  }

  const previousTransport = retrieveTransport();
  const previousSubscription = retrieveSubscription();

  if (previousTransport === transport && previousSubscription?.token === token) {
    logger.debug('Push subscription unmodified. Updating notification settings instead.');
    await updateDeviceNotificationSettings();
    return;
  }

  const isPushCapable = transport !== 'Notificare';
  const allowedUI = isPushCapable && getPushPermissionStatus() === 'granted';

  await updateCloudDevice({
    environment: getCloudApiEnvironment(),
    deviceId: device.id,
    payload: {
      transport,
      subscriptionId: token,
      keys,
      allowedUI,
      webPushCapable: hasWebPushCapabilities(),
    },
  });

  storeTransport(transport);

  const subscription: NotificarePushSubscription | undefined = token ? { token, keys } : undefined;
  storeSubscription(subscription);
  notifySubscriptionChanged(subscription);

  storeAllowedUI(allowedUI);
  notifyNotificationSettingsChanged(allowedUI);

  await ensureLoggedPushRegistration();
}

async function updateDeviceNotificationSettings() {
  if (!isConfigured()) throw new NotificareNotConfiguredError();

  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  const previousAllowedUI = retrieveAllowedUI();

  const transport = retrieveTransport();
  const isPushCapable = !!transport && transport !== 'Notificare';
  const allowedUI = isPushCapable && getPushPermissionStatus() === 'granted';

  if (previousAllowedUI !== allowedUI) {
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

  await ensureLoggedPushRegistration();
}

async function ensureLoggedPushRegistration() {
  const allowedUI = retrieveAllowedUI();

  const firstRegistrationStr = localStorage.getItem('re.notifica.push.first_registration');
  const firstRegistration = firstRegistrationStr == null || firstRegistrationStr === 'true';

  if (allowedUI && firstRegistration) {
    try {
      await logPushRegistration();
      localStorage.setItem('re.notifica.push.first_registration', 'false');
    } catch (e) {
      logger.warning('Failed to log the push registration event.', e);
    }
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
    const transport = retrieveTransport();
    const hasPushPermission = getPushPermissionStatus() === 'granted';
    const canEnableRemoteNotifications = !device || !transport || transport === 'Notificare';

    if (hasPushPermission && canEnableRemoteNotifications) {
      logger.debug('Enabling remote notifications due to a permission status change.');
      enableRemoteNotifications().catch((e) =>
        logger.warning('Failed to enable remote notifications.', e),
      );

      return;
    }

    logger.debug('Updating notification settings due to a permission status change.');
    updateDeviceNotificationSettings().catch((e) =>
      logger.warning('Unable to update the notification settings.', e),
    );
  };
}
