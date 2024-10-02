import {
  EventSubscription,
  NotificareNotification,
  NotificareNotificationAction,
} from '@notificare/web-core';
import { logger } from '../logger';
import { NotificareNotificationDeliveryMechanism } from '../models/notificare-notification-delivery-mechanism';
import { NotificarePushSubscription } from '../models/notificare-push-subscription';
import { NotificareSystemNotification } from '../models/notificare-system-notification';

let subscriptionChangedCallback: OnSubscriptionChangedCallback | undefined;
let notificationSettingsChangedCallback: OnNotificationSettingsChangedCallback | undefined;
let notificationReceivedCallback: OnNotificationReceivedCallback | undefined;
let notificationOpenedCallback: OnNotificationOpenedCallback | undefined;
let notificationActionOpenedCallback: OnNotificationActionOpenedCallback | undefined;
let systemNotificationReceivedCallback: OnSystemNotificationReceivedCallback | undefined;
let unknownNotificationReceivedCallback: OnUnknownNotificationReceivedCallback | undefined;

export type OnSubscriptionChangedCallback = (
  subscription: NotificarePushSubscription | undefined,
) => void;
export type OnNotificationSettingsChangedCallback = (allowedUI: boolean) => void;
export type OnNotificationReceivedCallback = (
  notification: NotificareNotification,
  deliveryMechanism: NotificareNotificationDeliveryMechanism,
) => void;
export type OnNotificationOpenedCallback = (notification: NotificareNotification) => void;
export type OnNotificationActionOpenedCallback = (
  notification: NotificareNotification,
  action: NotificareNotificationAction,
) => void;
export type OnSystemNotificationReceivedCallback = (
  notification: NotificareSystemNotification,
) => void;
export type OnUnknownNotificationReceivedCallback = (notification: unknown) => void;

export function onSubscriptionChanged(callback: OnSubscriptionChangedCallback): EventSubscription {
  subscriptionChangedCallback = callback;

  return {
    remove: () => {
      subscriptionChangedCallback = undefined;
    },
  };
}

export function onNotificationSettingsChanged(
  callback: OnNotificationSettingsChangedCallback,
): EventSubscription {
  notificationSettingsChangedCallback = callback;

  return {
    remove: () => {
      notificationSettingsChangedCallback = undefined;
    },
  };
}

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

export function notifySubscriptionChanged(subscription: NotificarePushSubscription | undefined) {
  const callback = subscriptionChangedCallback;
  if (!callback) {
    logger.debug("The 'subscription_changed' handler is not configured.");
    return;
  }

  callback(subscription);
}

export function notifyNotificationSettingsChanged(allowedUI: boolean) {
  const callback = notificationSettingsChangedCallback;
  if (!callback) {
    logger.debug("The 'notification_settings_changed' handler is not configured.");
    return;
  }

  callback(allowedUI);
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
