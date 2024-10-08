import {
  getApplication,
  getCurrentDevice,
  getOptions,
  NotificareApplicationUnavailableError,
  NotificareInternalOptions,
  NotificareNotConfiguredError,
} from '@notificare/web-core';
import { logger } from '../../logger';
import { arrayBufferToBase64Url, base64UrlToUint8Array } from '../utils';
import { isStandaloneMode } from '../utils/device';
import { encodeWorkerConfiguration, parseWorkerConfiguration } from './configuration/parser';
import { WorkerConfiguration } from './configuration/worker-configuration';

const SUBSCRIPTION_EXPIRATION_TIME_LEEWAY_MILLIS = 432000000;

export async function registerServiceWorker(
  options: NotificareInternalOptions,
): Promise<ServiceWorkerRegistration> {
  const workerPathname = options.serviceWorker ?? '/sw.js';

  if (!hasSupportedProtocol(options.applicationHost)) {
    throw new Error('Service workers are only available over HTTPS or localhost.');
  }

  const activeRegistration = await getActiveWorkerRegistration(workerPathname);
  if (activeRegistration) {
    logger.debug('Using previously registered service worker.');
    return activeRegistration;
  }

  logger.debug('Registering new service worker.');

  let registrationOptions: RegistrationOptions | undefined;
  if (options.serviceWorkerScope) {
    registrationOptions = {
      scope: options.serviceWorkerScope,
    };
  }

  const url = getConfiguredWorkerUrl(workerPathname);
  await navigator.serviceWorker.register(url, registrationOptions);

  return navigator.serviceWorker.ready;
}

export async function createWebPushSubscription(
  registration: ServiceWorkerRegistration,
  vapidPublicKey: string,
): Promise<PushSubscription> {
  const currentSubscription = await registration.pushManager.getSubscription();

  if (currentSubscription) {
    logger.debug('Validating the current push subscription.');

    const currentApplicationServerKey =
      currentSubscription.options.applicationServerKey &&
      arrayBufferToBase64Url(currentSubscription.options.applicationServerKey);

    if (currentApplicationServerKey !== vapidPublicKey) {
      logger.warning('The VAPID public keys changed.');

      logger.debug('Removing stable push subscription.');
      await currentSubscription.unsubscribe();

      logger.debug('Subscribing for push notifications again.');
      return subscribe(registration, vapidPublicKey);
    }

    if (subscriptionAboutToExpire(currentSubscription)) {
      logger.debug('Renewing existing push subscription.');
      await currentSubscription.unsubscribe();

      return subscribe(registration, vapidPublicKey);
    }
  }

  logger.debug('Subscribing for push notifications.');
  return subscribe(registration, vapidPublicKey);
}

function hasSupportedProtocol(applicationHost: string): boolean {
  return applicationHost.includes('localhost') || applicationHost.startsWith('https');
}

async function getActiveWorkerRegistration(
  workerPathname: string,
): Promise<ServiceWorkerRegistration | undefined> {
  const registrations = await navigator.serviceWorker.getRegistrations();
  return registrations.find((r) => isValidWorkerRegistration(r, workerPathname));
}

function isValidWorkerRegistration(
  registration: ServiceWorkerRegistration,
  workerPathname: string,
) {
  const worker = registration.active;
  if (!worker) return true;

  const workerUrl = new URL(worker.scriptURL);
  if (workerUrl.pathname !== workerPathname) return false;

  const workerEncodedConfig = workerUrl.searchParams.get('notificareConfig');
  if (!workerEncodedConfig) return false;

  const workerConfig = parseWorkerConfiguration(workerEncodedConfig);
  if (!workerConfig) return false;

  const expectedConfig = getWorkerConfiguration();
  return areSameWorkerConfiguration(workerConfig, expectedConfig);
}

function getConfiguredWorkerUrl(location: string): string {
  const config = getWorkerConfiguration();
  const encoded = encodeWorkerConfiguration(config);

  const url = new URL(location, window.location.origin);
  url.searchParams.set('notificareConfig', encoded);

  return url.href.replace(window.location.origin, '');
}

function getWorkerConfiguration(): WorkerConfiguration {
  const options = getOptions();
  if (!options) throw new NotificareNotConfiguredError();

  const application = getApplication();
  if (!application) throw new NotificareApplicationUnavailableError();

  const device = getCurrentDevice();

  return {
    cloudHost: options.hosts.cloudApi,
    applicationId: application.id,
    applicationKey: options.applicationKey,
    applicationSecret: options.applicationSecret,
    deviceId: device?.id,
    standalone: isStandaloneMode() ? true : undefined,
  };
}

function areSameWorkerConfiguration(
  config: WorkerConfiguration,
  expectedConfig: WorkerConfiguration,
) {
  return (
    expectedConfig.cloudHost === config.cloudHost &&
    expectedConfig.applicationId === config.applicationId &&
    expectedConfig.applicationKey === config.applicationKey &&
    expectedConfig.applicationSecret === config.applicationSecret &&
    expectedConfig.deviceId === config.deviceId &&
    expectedConfig.standalone === config.standalone
  );
}

function subscriptionAboutToExpire(subscription: PushSubscription): boolean {
  const { expirationTime } = subscription;
  if (!expirationTime) return false;

  return Date.now() > expirationTime - SUBSCRIPTION_EXPIRATION_TIME_LEEWAY_MILLIS;
}

async function subscribe(
  registration: ServiceWorkerRegistration,
  vapidPublicKey: string,
): Promise<PushSubscription> {
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: base64UrlToUint8Array(vapidPublicKey),
  });
}
