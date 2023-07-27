import { Component, getApplication } from '@notificare/core';
import { handleServiceWorkerMessage, hasWebPushSupport } from './internal-api-web-push';
import { handleAutoOnboarding, handleFloatingButton } from './internal-api';
import { logger } from '../logger';
import { handleNotificationOpened } from './internal-api-shared';

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
    this.handleOnboarding();
    this.handleSafariWebPushNotification();
  }

  async unlaunch(): Promise<void> {
    localStorage.removeItem('re.notifica.push.first_registration');
    localStorage.removeItem('re.notifica.push.onboarding_last_attempt');

    // // Update the local notification settings.
    // // Registering a temporary device automatically reports the allowedUI to the API.
    // allowedUI = false
  }

  private handleOnboarding() {
    const application = getApplication();
    if (!application) return;

    if (!application.websitePushConfig?.launchConfig) {
      logger.debug('Push component running in manual mode.');
      return;
    }

    const { autoOnboardingOptions } = application.websitePushConfig.launchConfig;
    if (autoOnboardingOptions) {
      logger.debug('Handling the automatic onboarding.');
      handleAutoOnboarding(application, autoOnboardingOptions).catch((error) =>
        logger.error(`Unable to automatically enable remote notifications: ${error}`),
      );

      return;
    }

    const { floatingButtonOptions } = application.websitePushConfig.launchConfig;
    if (floatingButtonOptions) {
      logger.debug('Handling the floating button.');
      handleFloatingButton(application, floatingButtonOptions).catch((error) =>
        logger.error(`Unable to handle the floating button: ${error}`),
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
