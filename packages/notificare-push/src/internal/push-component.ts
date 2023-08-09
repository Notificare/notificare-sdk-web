import { Component, getApplication, getCurrentDevice } from '@notificare/web-core';
import {
  disableWebPushNotifications,
  handleServiceWorkerMessage,
  hasWebPushSupport,
} from './internal-api-web-push';
import {
  enableRemoteNotifications,
  handleAutoOnboarding,
  handleFloatingButton,
  hasWebPushCapabilities,
} from './internal-api';
import { logger } from '../logger';
import { handleNotificationOpened } from './internal-api-shared';
import {
  getRemoteNotificationsEnabled,
  setRemoteNotificationsEnabled,
} from './storage/local-storage';

/* eslint-disable class-methods-use-this */
export class PushComponent extends Component {
  constructor() {
    super('push');
  }

  configure() {
    if (hasWebPushSupport()) {
      navigator.serviceWorker.onmessage = handleServiceWorkerMessage;
    }
  }

  async launch(): Promise<void> {
    if (getRemoteNotificationsEnabled()) {
      try {
        logger.debug('Automatically enabling remote notification.');
        await enableRemoteNotifications();
      } catch (e) {
        logger.error('Failed to automatically enable remote notifications.');
      }
    }

    this.handleOnboarding();
    this.handleSafariWebPushNotification();
  }

  async unlaunch(): Promise<void> {
    localStorage.removeItem('re.notifica.push.first_registration');
    localStorage.removeItem('re.notifica.push.onboarding_last_attempt');

    // // Update the local notification settings.
    // // Registering a temporary device automatically reports the allowedUI to the API.
    // allowedUI = false

    const device = getCurrentDevice();
    if (device && device.transport === 'WebPush') {
      await disableWebPushNotifications();
    }

    setRemoteNotificationsEnabled(false);
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

    handleNotificationOpened(notificationId).catch((error) =>
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
}
