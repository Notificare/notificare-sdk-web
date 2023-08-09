import { NotificareInternalOptions } from '@notificare/web-core';
import { logger } from '../../logger';
import { arrayBufferToBase64Url, base64UrlToUint8Array } from '../utils';

export async function registerServiceWorker(
  options: NotificareInternalOptions,
): Promise<ServiceWorkerRegistration> {
  const workerLocation = options.serviceWorker ?? '/sw.js';

  if (!hasSupportedProtocol(options.applicationHost)) {
    throw new Error('Service workers are only available over HTTPS or localhost.');
  }

  const activeRegistration = await getActiveWorkerRegistration(workerLocation);
  if (activeRegistration) {
    logger.debug('Using previously registered service worker.');
    return navigator.serviceWorker.ready;
  }

  logger.debug('Registering new service worker.');

  let registrationOptions: RegistrationOptions | undefined;
  if (options.serviceWorkerScope) {
    registrationOptions = {
      scope: options.serviceWorkerScope,
    };
  }

  await navigator.serviceWorker.register(workerLocation, registrationOptions);
  return navigator.serviceWorker.ready;
}

export async function createWebPushSubscription(
  registration: ServiceWorkerRegistration,
  vapidPublicKey: string,
): Promise<PushSubscription> {
  //
  const currentSubscription = await registration.pushManager.getSubscription();

  if (currentSubscription) {
    const currentApplicationServerKey =
      currentSubscription.options.applicationServerKey &&
      arrayBufferToBase64Url(currentSubscription.options.applicationServerKey);

    if (currentApplicationServerKey !== vapidPublicKey) {
      logger.warning('The VAPID public keys changed.');

      logger.debug('Removing stable push subscription.');
      await currentSubscription.unsubscribe();

      logger.debug('Subscribing for push notifications again.');
      return registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlToUint8Array(vapidPublicKey),
      });
    }

    if (subscriptionAboutToExpire(currentSubscription)) {
      logger.debug('Renewing existing push subscription.');
      await currentSubscription.unsubscribe();

      return registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlToUint8Array(vapidPublicKey),
      });
    }

    logger.debug('Using the current push subscription.');
    return currentSubscription;
  }

  logger.debug('Subscribing for push notifications.');
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: base64UrlToUint8Array(vapidPublicKey),
  });
}

function hasSupportedProtocol(applicationHost: string): boolean {
  return applicationHost.includes('localhost') || applicationHost.startsWith('https');
}

async function getActiveWorkerRegistration(
  workerLocation: string,
): Promise<ServiceWorkerRegistration | undefined> {
  const registrations = await navigator.serviceWorker.getRegistrations();
  return registrations.find((r) => r.active?.scriptURL?.includes(workerLocation));
}

function subscriptionAboutToExpire(subscription: PushSubscription): boolean {
  const { expirationTime } = subscription;
  if (!expirationTime) return false;

  return Date.now() > expirationTime - 432000000;
}
