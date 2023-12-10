import {
  broadcastComponentEvent,
  fetchApplication,
  fetchNotification,
  isReady,
  logNotificationOpen,
  NotificareApplication,
  NotificareInternalOptions,
  NotificareNotification,
} from '@notificare/web-core';
import { logger } from '../logger';
import { NotificareNotificationDeliveryMechanism } from '../models/notificare-notification-delivery-mechanism';
import {
  notifyNotificationActionOpened,
  notifyNotificationOpened,
  notifyNotificationReceived,
  notifySystemNotificationReceived,
  notifyUnknownNotificationReceived,
} from './consumer-events';
import { logNotificationInfluenced, logNotificationReceived } from './internal-api-events';
import { arrayBufferToBase64 } from './utils';
import { isStandaloneMode, isSafariDesktopBrowser } from './utils/device';
import { createWebPushSubscription, registerServiceWorker } from './web-push/service-worker';

export function hasWebPushSupport(): boolean {
  // The navigator.standalone check ensures that iOS Safari with WebPush
  // support is running in 'Add To Home Screen' mode.

  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'showNotification' in ServiceWorkerRegistration.prototype &&
    (navigator.standalone === undefined || isStandaloneMode() || isSafariDesktopBrowser())
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

export async function postMessageToServiceWorker(message: unknown): Promise<void> {
  const registration = await navigator.serviceWorker.ready;
  if (!registration.active) throw new Error('Service worker is not active.');

  registration.active.postMessage(message);
}

export async function handleServiceWorkerMessage(event: MessageEvent) {
  if (isReady()) {
    try {
      await postMessageToServiceWorker({
        action: 're.notifica.ready',
      });
    } catch (e) {
      logger.warning('Failed to send a message to the service worker.', e);
    }
  }

  if (!event.data) return;

  switch (event.data.cmd) {
    case 're.notifica.push.sw.notification_received':
      await handleServiceWorkerNotificationReceived(event);
      break;
    case 're.notifica.push.sw.notification_clicked':
      await handleServiceWorkerNotificationClicked(event);
      break;
    case 're.notifica.push.sw.notification_reply':
      await handleServiceWorkerNotificationReply(event);
      break;
    case 're.notifica.push.sw.system_notification_received':
      await handleServiceWorkerSystemNotificationReceived(event);
      break;
    case 're.notifica.push.sw.unknown_notification_received':
      await handleServiceWorkerUnknownNotificationReceived(event);
      break;
    case 're.notifica.push.sw.update_inbox':
      await handleServiceWorkerUpdateInbox();
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
  broadcastComponentEvent('notification_received');

  let notification: NotificareNotification;
  let deliveryMechanism: NotificareNotificationDeliveryMechanism;

  if (event.data.content) {
    // Standard format
    notification = event.data.content.notification;
    deliveryMechanism = event.data.content.message.push ? 'standard' : 'silent';
  } else {
    // Legacy format
    await logNotificationReceived(event.data.message.notificationId);

    notification = await fetchNotification(event.data.message.id);
    deliveryMechanism = event.data.message.push ? 'standard' : 'silent';
  }

  notifyNotificationReceived(notification, deliveryMechanism);
}

async function handleServiceWorkerNotificationClicked(event: MessageEvent) {
  if (event.data.content) {
    // Notify the inbox to update itself.
    broadcastComponentEvent('notification_opened');

    const { notification, action } = event.data.content;

    if (action) {
      notifyNotificationActionOpened(notification, action);
    } else {
      notifyNotificationOpened(notification);
    }

    return;
  }

  const notificationId = event.data.notification.id;

  // Log the notification open event.
  await logNotificationOpen(notificationId);
  await logNotificationInfluenced(notificationId);

  // Notify the inbox to update itself.
  broadcastComponentEvent('notification_opened');

  const notification = await fetchNotification(notificationId);
  notifyNotificationOpened(notification);
}

async function handleServiceWorkerNotificationReply(event: MessageEvent) {
  // Log the notification open event.
  await logNotificationOpen(event.data.notification.notificationId);
  await logNotificationInfluenced(event.data.notification.notificationId);

  // Notify the inbox to mark the item as read.
  // InboxIntegration.markItemAsRead(message)

  const notification = await fetchNotification(event.data.notification.id);
  const action = notification.actions.find((element) => element.id === event.data.action);

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

async function handleServiceWorkerUpdateInbox() {
  // Notify the inbox to update itself.
  broadcastComponentEvent('notification_opened');
}
