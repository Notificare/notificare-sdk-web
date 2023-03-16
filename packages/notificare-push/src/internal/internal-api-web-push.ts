import { NotificareApplication, NotificareInternalOptions } from '@notificare/core';
import { arrayBufferToBase64, arrayBufferToBase64Url, base64UrlToUint8Array } from './utils';
import { logger } from '../logger';

export function hasWebPushSupport(): boolean {
  // The navigator.standalone check ensures that iOS Safari with WebPush
  // support is running in 'Add To Home Screen' mode.

  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'showNotification' in ServiceWorkerRegistration.prototype &&
    (navigator.standalone === undefined || navigator.standalone)
  );
}

export async function enableWebPushNotifications(
  application: NotificareApplication,
  options: NotificareInternalOptions,
): Promise<PushToken> {
  const publicKey = application.webPushConfig?.vapid?.publicKey;
  if (!publicKey) {
    throw new Error(
      'Missing VAPID configuration. Please check your Website Push configurations in our dashboard before proceeding.',
    );
  }

  const serviceWorkerLocation = options.serviceWorker;
  if (!serviceWorkerLocation) {
    throw new Error(
      'Missing service worker location. Please check your configurations (config.json).',
    );
  }

  const serviceWorkerAllowed =
    options.applicationHost.includes('localhost') || options.applicationHost.startsWith('https');

  if (!serviceWorkerAllowed) {
    throw new Error('Service workers are only available over HTTPS or localhost.');
  }

  let registrationOptions: RegistrationOptions | undefined;
  if (options.serviceWorkerScope) {
    registrationOptions = {
      scope: options.serviceWorkerScope,
    };
  }

  await registerServiceWorker(serviceWorkerLocation, registrationOptions);

  const registration = await navigator.serviceWorker.ready;
  const existingSubscription = await registration.pushManager.getSubscription();

  if (
    !existingSubscription ||
    !existingSubscription.options.applicationServerKey ||
    arrayBufferToBase64Url(existingSubscription.options.applicationServerKey) !==
      application.webPushConfig.vapid.publicKey
  ) {
    logger.debug('Subscribing for push notifications.');

    try {
      const subscription = await registration.pushManager.subscribe({
        // name: 'push',
        userVisibleOnly: true,
        applicationServerKey: base64UrlToUint8Array(application.webPushConfig.vapid.publicKey),
      });

      return getPushTokenFromPushSubscription(subscription);
    } catch (e) {
      if (
        existingSubscription &&
        existingSubscription.options.applicationServerKey &&
        arrayBufferToBase64Url(existingSubscription.options.applicationServerKey) !==
          application.webPushConfig.vapid.publicKey
      ) {
        logger.info('Removing stale push subscription.');
        await existingSubscription.unsubscribe();

        throw new Error(
          'Subscription for service worker is no longer valid and has been unsubscribed. Please register again.',
        );
      }

      logger.error('Failed to subscribe to push notifications.', e);
      throw e;
    }
  }

  // If there's an expiration date, renew subscription 5 days before the end.
  if (
    existingSubscription.expirationTime &&
    Date.now() > existingSubscription.expirationTime - 432000000
  ) {
    logger.debug('Renewing existing push subscription.');

    await existingSubscription.unsubscribe();
    await registration.pushManager.subscribe({
      // name: 'push',
      userVisibleOnly: true,
      applicationServerKey: base64UrlToUint8Array(application.webPushConfig.vapid.publicKey),
    });
  }

  return getPushTokenFromPushSubscription(existingSubscription);
}

export async function disableWebPushNotifications() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    logger.warning('No push subscription when disabling web push.');
    return;
  }

  await subscription.unsubscribe();
}

export interface PushToken {
  endpoint: string;
  keys?: PushKeys;
}

export interface PushKeys {
  p256dh: string;
  auth: string;
}

async function registerServiceWorker(
  serviceWorkerLocation: string,
  options: RegistrationOptions | undefined,
) {
  const registrations = await navigator.serviceWorker.getRegistrations();

  const activeRegistration = registrations.find((r) =>
    r.active?.scriptURL?.includes(serviceWorkerLocation),
  );

  if (activeRegistration) {
    logger.warning('Using previously registered service worker.');
    return;
  }

  logger.debug('Registering new service worker.');
  await navigator.serviceWorker.register(serviceWorkerLocation, options);
}

function getPushTokenFromPushSubscription(subscription: PushSubscription): PushToken {
  const rawKey = subscription.getKey('p256dh');
  const rawAuthSecret = subscription.getKey('auth');

  let keys: PushKeys | undefined;
  if (rawKey && rawAuthSecret) {
    keys = {
      p256dh: arrayBufferToBase64(rawKey),
      auth: arrayBufferToBase64(rawAuthSecret),
    };
  }

  return {
    endpoint: subscription.endpoint,
    keys,
  };
}
