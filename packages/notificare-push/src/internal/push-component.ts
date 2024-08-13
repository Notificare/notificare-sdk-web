import {
  broadcastComponentEvent,
  Component,
  executeComponentCommand,
  fetchNotification,
  getApplication,
  getCurrentDevice,
  getOptions,
  logNotificationOpen,
} from '@notificare/web-core';
import { logger } from '../logger';
import { getPushPermissionStatus } from '../utils/push';
import { notifyNotificationOpened } from './consumer-events';
import {
  enableRemoteNotifications,
  handleAutoOnboarding,
  handleFloatingButton,
  hasWebPushCapabilities,
  monitorPushPermissionChanges,
} from './internal-api';
import { logNotificationInfluenced } from './internal-api-events';
import {
  disableWebPushNotifications,
  handleServiceWorkerMessage,
  hasWebPushSupport,
} from './internal-api-web-push';
import {
  getRemoteNotificationsEnabled,
  retrieveTransport,
  setRemoteNotificationsEnabled,
  storeAllowedUI,
  storeSubscription,
  storeTransport,
} from './storage/local-storage';
import { hideFloatingButton } from './ui/floating-button';
import { hideOnboarding } from './ui/onboarding';

/* eslint-disable class-methods-use-this */
export class PushComponent extends Component {
  constructor() {
    super('push');
  }

  migrate() {
    const lastAttemptStr = localStorage.getItem('notificareOnboardingLastAttempt');
    if (lastAttemptStr) {
      const lastAttempt = parseInt(lastAttemptStr, 10);
      if (!Number.isNaN(lastAttempt)) {
        localStorage.setItem('re.notifica.push.onboarding_last_attempt', lastAttempt.toString());
      }
    }

    const deviceStr = localStorage.getItem('notificareDevice');
    if (deviceStr) {
      try {
        const device = JSON.parse(deviceStr);

        if (device.transport !== 'Notificare' || device.allowedUI) {
          setRemoteNotificationsEnabled(true);
        }

        if (device.allowedUI) {
          localStorage.setItem('re.notifica.push.first_registration', 'false');
        }
      } catch (e) {
        logger.error('Unable to decode the legacy device.', e);
      }
    }

    localStorage.removeItem('notificareOnboardingLastAttempt');
  }

  configure() {
    if (hasWebPushSupport()) {
      navigator.serviceWorker.onmessage = handleServiceWorkerMessage;
    }

    monitorPushPermissionChanges()
      .then(() => logger.debug('Started monitoring push permission changes.'))
      .catch((error) => logger.error('Unable to monitor push permission changes.', error));
  }

  async launch(): Promise<void> {
    const options = getOptions();

    const device = getCurrentDevice();
    const transport = retrieveTransport();
    const isTemporaryDevice = device && (!transport || transport === 'Notificare');

    // An undefined getRemoteNotificationsEnabled() likely means the user or the app
    // tampered with the local storage. We can recover based on the browser permission.
    const canEnableRemoteNotifications =
      getRemoteNotificationsEnabled() !== false && getPushPermissionStatus() === 'granted';

    if (options?.ignoreTemporaryDevices && isTemporaryDevice && !canEnableRemoteNotifications) {
      try {
        await executeComponentCommand({
          component: 'device',
          command: 'deleteDevice',
        });
      } catch (e) {
        logger.error('Failed to clean up temporary device.', e);
      }
    }

    if (canEnableRemoteNotifications) {
      try {
        logger.debug('Automatically enabling remote notifications.');
        await enableRemoteNotifications();
      } catch (e) {
        logger.error('Failed to automatically enable remote notifications.', e);
      }
    }

    this.handleSafariWebPushNotification();
  }

  async unlaunch(): Promise<void> {
    this.removeOnboardingElements();

    localStorage.removeItem('re.notifica.push.first_registration');
    localStorage.removeItem('re.notifica.push.onboarding_last_attempt');

    const transport = retrieveTransport();
    if (transport === 'WebPush') {
      await disableWebPushNotifications();
    }

    setRemoteNotificationsEnabled(undefined);
    storeTransport(undefined);
    storeSubscription(undefined);
    storeAllowedUI(undefined);
  }

  async postLaunch(): Promise<void> {
    this.handleOnboarding();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async executeCommand(command: string, data?: unknown): Promise<unknown> {
    if (command === 'hasWebPushSupport') {
      return hasWebPushSupport();
    }

    throw new Error(`Unsupported command '${command}' in '${this.name}' component.`);
  }

  private handleOnboarding() {
    const application = getApplication();
    if (!application?.websitePushConfig?.launchConfig) return;

    if (!hasWebPushCapabilities()) {
      logger.info('The browser does not support remote notifications.');
      return;
    }

    const { autoOnboardingOptions } = application.websitePushConfig.launchConfig;
    if (autoOnboardingOptions) {
      logger.debug('Handling the automatic onboarding.');
      handleAutoOnboarding(application, autoOnboardingOptions).catch((error) =>
        logger.error(`Failed to handle the automatic onboarding: ${error}`),
      );

      return;
    }

    const { floatingButtonOptions } = application.websitePushConfig.launchConfig;
    if (floatingButtonOptions) {
      logger.debug('Handling the floating button.');
      handleFloatingButton(application, floatingButtonOptions).catch((error) =>
        logger.error(`Failed to handle the floating button: ${error}`),
      );
    }
  }

  private handleSafariWebPushNotification() {
    // Do nothing when running in Web Push mode.
    if (hasWebPushSupport()) return;

    const application = getApplication();
    if (!application) return;

    const urlFormatString = application.websitePushConfig?.urlFormatString;
    if (!urlFormatString) return;

    const notificationId =
      this.checkSafariWebPushNotification(urlFormatString) ??
      this.checkSafariWebPushNotificationFallback(urlFormatString);

    if (!notificationId) return;

    this.handleSafariNotificationOpened(notificationId).catch((error) =>
      logger.error(`Unable to handle the notification open: ${error}`),
    );
  }

  private checkSafariWebPushNotification(urlFormatString: string): string | undefined {
    // Exact match between URLFormatString and current window.location
    const regex = new RegExp(
      urlFormatString.replace(/([.*+?^${}()|[\]/\\])/g, '\\$1').replace('%@', '(\\w+)'),
    );

    const components = regex.exec(window.location.toString());
    if (!components || components.length < 2) return undefined;

    return components[1];
  }

  private checkSafariWebPushNotificationFallback(urlFormatString: string): string | undefined {
    // Fallback to match by query param
    const templateSearchParameters = new URL(urlFormatString).searchParams;
    const locationSearchParameters = new URLSearchParams(window.location.search);

    let notificationSearchParameter: string | undefined;

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of templateSearchParameters.entries()) {
      if (value === '%@') {
        notificationSearchParameter = key;
        break;
      }
    }

    if (
      !notificationSearchParameter ||
      !locationSearchParameters.has(notificationSearchParameter)
    ) {
      return undefined;
    }

    const notificationId = locationSearchParameters.get(notificationSearchParameter);
    if (!notificationId) return undefined;

    return notificationId;
  }

  private async handleSafariNotificationOpened(notificationId: string) {
    // Log the notification open event.
    await logNotificationOpen(notificationId);
    await logNotificationInfluenced(notificationId);

    // Notify the inbox to update itself.
    broadcastComponentEvent('notification_opened');

    const notification = await fetchNotification(notificationId);
    notifyNotificationOpened(notification);
  }

  private removeOnboardingElements() {
    hideOnboarding();
    hideFloatingButton();
  }
}
