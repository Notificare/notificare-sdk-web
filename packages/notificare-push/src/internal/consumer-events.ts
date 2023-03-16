import {
  EventSubscription,
  NotificareNotification,
  NotificareNotificationAction,
} from '@notificare/core';
import { logger } from '../logger';
import { NotificareNotificationDeliveryMechanism } from '../models/notificare-notification-delivery-mechanism';
import { NotificareSystemNotification } from '../models/notificare-system-notification';

let notificationReceivedCallback: OnNotificationReceivedCallback | undefined;
let notificationOpenedCallback: OnNotificationOpenedCallback | undefined;
let notificationActionOpenedCallback: OnNotificationActionOpenedCallback | undefined;
let systemNotificationReceivedCallback: OnSystemNotificationReceivedCallback | undefined;
let unknownNotificationReceivedCallback: OnUnknownNotificationReceivedCallback | undefined;

type OnNotificationReceivedCallback = (
  notification: NotificareNotification,
  deliveryMechanism: NotificareNotificationDeliveryMechanism,
) => void;
type OnNotificationOpenedCallback = (notification: NotificareNotification) => void;
type OnNotificationActionOpenedCallback = (
  notification: NotificareNotification,
  action: NotificareNotificationAction,
) => void;
type OnSystemNotificationReceivedCallback = (notification: NotificareSystemNotification) => void;
type OnUnknownNotificationReceivedCallback = (notification: unknown) => void;

export function onNotificationReceived(
  callback: OnNotificationReceivedCallback,
): EventSubscription {
  notificationReceivedCallback = callback;

  return {
    remove: () => {
      notificationReceivedCallback = undefined;
    },
  };
}

export function onNotificationOpened(callback: OnNotificationOpenedCallback): EventSubscription {
  notificationOpenedCallback = callback;

  return {
    remove: () => {
      notificationOpenedCallback = undefined;
    },
  };
}

export function onNotificationActionOpened(
  callback: OnNotificationActionOpenedCallback,
): EventSubscription {
  notificationActionOpenedCallback = callback;

  return {
    remove: () => {
      notificationActionOpenedCallback = undefined;
    },
  };
}

export function onSystemNotificationReceived(
  callback: OnSystemNotificationReceivedCallback,
): EventSubscription {
  systemNotificationReceivedCallback = callback;

  return {
    remove: () => {
      systemNotificationReceivedCallback = undefined;
    },
  };
}

export function onUnknownNotificationReceived(
  callback: OnUnknownNotificationReceivedCallback,
): EventSubscription {
  unknownNotificationReceivedCallback = callback;

  return {
    remove: () => {
      unknownNotificationReceivedCallback = undefined;
    },
  };
}

export function notifyNotificationReceived(
  notification: NotificareNotification,
  deliveryMechanism: NotificareNotificationDeliveryMechanism,
) {
  const callback = notificationReceivedCallback;
  if (!callback) {
    logger.warning("The 'notification_received' handler is not configured.");
    return;
  }

  callback(notification, deliveryMechanism);
}

export function notifyNotificationOpened(notification: NotificareNotification) {
  const callback = notificationOpenedCallback;
  if (!callback) {
    logger.warning("The 'notification_opened' handler is not configured.");
    return;
  }

  callback(notification);
}

export function notifyNotificationActionOpened(
  notification: NotificareNotification,
  action: NotificareNotificationAction,
) {
  const callback = notificationActionOpenedCallback;
  if (!callback) {
    logger.warning("The 'notification_action_opened' handler is not configured.");
    return;
  }

  callback(notification, action);
}

export function notifySystemNotificationReceived(notification: NotificareSystemNotification) {
  const callback = systemNotificationReceivedCallback;
  if (!callback) {
    logger.warning("The 'system_notification_received' handler is not configured.");
    return;
  }

  callback(notification);
}

export function notifyUnknownNotificationReceived(notification: unknown) {
  const callback = unknownNotificationReceivedCallback;
  if (!callback) {
    logger.warning("The 'unknown_notification_received' handler is not configured.");
    return;
  }

  callback(notification);
}
