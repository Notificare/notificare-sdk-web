import {
  NotificareApplication,
  NotificareWebsitePushConfigLaunchConfigAutoOnboardingOptions,
  NotificareWebsitePushConfigLaunchConfigFloatingButtonOptions,
} from '@notificare/core';
import { enableRemoteNotifications, hasWebPushCapabilities } from '../public-api';
import { logger } from '../logger';
import { sleep } from './utils';
import { showOnboarding } from './ui/onboarding';
import { showFloatingButton } from './ui/floating-button';
import { getPushPermissionStatus } from './utils/push';

export async function handleAutoOnboarding(
  application: NotificareApplication,
  autoOnboardingOptions: NotificareWebsitePushConfigLaunchConfigAutoOnboardingOptions,
) {
  if (!hasWebPushCapabilities()) {
    logger.info('The browser does not support remote notifications.');
    return;
  }

  const permission = getPushPermissionStatus();

  if (permission === 'denied') {
    logger.info('The user denied remote notifications.');
    return;
  }

  if (permission === 'granted') {
    logger.debug('Automatically enabling remote notifications.');
    await enableRemoteNotifications();
    return;
  }

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
  const permission = getPushPermissionStatus();
  if (permission === 'granted') {
    logger.debug('Automatically enabling remote notifications.');
    await enableRemoteNotifications();
  }

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
