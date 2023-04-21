import {
  fetchApplication,
  fetchNotification,
  logNotificationOpen,
  NotificareApplication,
  NotificareInternalOptions,
} from '@notificare/core';
import { arrayBufferToBase64 } from './utils';
import { logger } from '../logger';
import { logNotificationInfluenced, logNotificationReceived } from './internal-api-events';
import {
  notifyNotificationActionOpened,
  notifyNotificationOpened,
  notifyNotificationReceived,
  notifySystemNotificationReceived,
  notifyUnknownNotificationReceived,
} from './consumer-events';
import { createWebPushSubscription, registerServiceWorker } from './web-push/service-worker';

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
  const publicKey = application.websitePushConfig?.vapid?.publicKey;
  if (!publicKey) {
    throw new Error(
      'Missing VAPID configuration. Please check your Website Push configurations in our dashboard before proceeding.',
    );
  }

  const registration = await registerServiceWorker(options);
  const subscription = await createWebPushSubscription(registration, publicKey);

  return getPushTokenFromPushSubscription(subscription);
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
