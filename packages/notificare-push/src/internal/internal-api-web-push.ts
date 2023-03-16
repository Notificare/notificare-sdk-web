import {
  fetchApplication,
  fetchNotification,
  logNotificationOpen,
  NotificareApplication,
  NotificareInternalOptions,
} from '@notificare/core';
import { arrayBufferToBase64, arrayBufferToBase64Url, base64UrlToUint8Array } from './utils';
import { logger } from '../logger';
import { logNotificationInfluenced, logNotificationReceived } from './internal-api-events';
import {
  notifyNotificationActionOpened,
  notifyNotificationOpened,
  notifyNotificationReceived,
  notifySystemNotificationReceived,
  notifyUnknownNotificationReceived,
} from './consumer-events';

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

export function postMessageToServiceWorker(message: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();

    // This sends the message data as well as transferring messageChannel.port2 to the service worker.
    // The service worker can then use the transferred port to reply via postMessage(), which
    // will in turn trigger the onmessage handler on messageChannel.port1.
    // See https://html.spec.whatwg.org/multipage/workers.html#dom-worker-postmessage

    const { controller } = navigator.serviceWorker;
    if (!controller) {
      reject(new Error('Unable to acquire the service worker controller.'));
      return;
    }

    controller.postMessage(message, [channel.port2]);
    resolve();
  });
}

export async function handleServiceWorkerMessage(event: MessageEvent) {
  if (!event.data) return;

  switch (event.data.cmd) {
    case 'notificationreceive':
      await handleServiceWorkerNotificationReceived(event);
      break;
    case 'notificationclick':
      await handleServiceWorkerNotificationClicked(event);
      break;
    case 'notificationreply':
      await handleServiceWorkerNotificationReply(event);
      break;
    case 'system':
      await handleServiceWorkerSystemNotificationReceived(event);
      break;
    case 'unknownpush':
      await handleServiceWorkerUnknownNotificationReceived(event);
      break;
    default:
      logger.warning('Unknown service worker message event: ', event);
  }
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

async function handleServiceWorkerNotificationReceived(event: MessageEvent) {
  // TODO: refresh the inbox badge.
  await logNotificationReceived(event.data.message.notificationId);

  const notification = await fetchNotification(event.data.message.id);
  notifyNotificationReceived(notification, event.data.message.push ? 'standard' : 'silent');
}

async function handleServiceWorkerNotificationClicked(event: MessageEvent) {
  // Log the notification open event.
  await logNotificationOpen(event.data.notification.notificationId);
  await logNotificationInfluenced(event.data.notification.notificationId);

  // Notify the inbox to mark the item as read.
  // InboxIntegration.markItemAsRead(message)

  const notification = await fetchNotification(event.data.notification.id);
  notifyNotificationOpened(notification);
}

async function handleServiceWorkerNotificationReply(event: MessageEvent) {
  // Log the notification open event.
  await logNotificationOpen(event.data.notification.notificationId);
  await logNotificationInfluenced(event.data.notification.notificationId);

  // Notify the inbox to mark the item as read.
  // InboxIntegration.markItemAsRead(message)

  const notification = await fetchNotification(event.data.notification.id);
  const action = notification.actions.find((element) => element.label === event.data.action);

  if (!action) {
    logger.warning('Cannot find the action clicked to process the event.');
    return;
  }

  notifyNotificationActionOpened(notification, action);
}

async function handleServiceWorkerSystemNotificationReceived(event: MessageEvent) {
  const notification = event.data.message;

  if (notification.notificationType.startsWith('re.notifica')) {
    logger.info(`Processing system notification: ${notification.notificationType}`);

    switch (notification.notificationType) {
      case 're.notifica.notification.system.Application':
        await fetchApplication();
        break;

      default:
        logger.warning(`Unhandled system notification: ${notification.notificationType}`);
    }
  } else {
    logger.info(`Processing custom system notification.`);

    const {
      id,
      notificationId,
      notificationType,
      push,
      system,
      systemType,
      urlFormatString,
      'x-sender': xSender,
      application,
      icon,
      ...extra
    } = notification;

    notifySystemNotificationReceived({
      id,
      type: systemType,
      extra,
    });
  }
}

async function handleServiceWorkerUnknownNotificationReceived(event: MessageEvent) {
  notifyUnknownNotificationReceived(event.data.message);
}
