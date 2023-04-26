import { Component, getApplication } from '@notificare/core';
import { handleServiceWorkerMessage, hasWebPushSupport } from './internal-api-web-push';
import { handleAutoOnboarding, handleFloatingButton } from './internal-api';
import { logger } from '../logger';

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
  }

  async unlaunch(): Promise<void> {
    //
  }

  handleOnboarding() {
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
}
