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

/**
 * Called when the device's push subscription changes.
 *
 * @param {OnSubscriptionChangedCallback} callback - A {@link OnSubscriptionChangedCallback} that
 * will be invoked with the result of the onSubscriptionChanged event.
 *  - The callback receives a single parameter:
 *     - `subscription`: The updated {@link NotificarePushSubscription}, or `undefined` if the
 *     subscription token is unavailable.
 * @returns {EventSubscription} - The {@link EventSubscription} for the onSubscriptionChanged event.
 */
export function onSubscriptionChanged(callback: OnSubscriptionChangedCallback): EventSubscription {
  subscriptionChangedCallback = callback;

  return {
    remove: () => {
      subscriptionChangedCallback = undefined;
    },
  };
}

/**
 * Called when the notification settings are changed.
 *
 * @param callback A {@link OnNotificationSettingsChangedCallback} that will be invoked with the
 * result of the onNotificationSettingsChanged event.
 *  - The callback receives a single parameter:
 *     - `allowedUI`: A Boolean indicating whether the app is permitted to display notifications.
 *     `true` if notifications are allowed, `false` if they are restricted by the user.
 * @returns {EventSubscription} - The {@link EventSubscription} for the onNotificationsSettingsChanged
 * event.
 */
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

/**
 * Called when a push notification is received.
 *
 * @param {OnNotificationReceivedCallback} callback - A {@link OnNotificationReceivedCallback} that
 * will be invoked with the result of the onNotificationReceived event.
 *  - The callback receives the following parameters:
 *     - `notification`: The received {@link NotificareNotification} object.
 *     - `deliveryMechanism`: The mechanism used to deliver the notification.
 * @returns {EventSubscription} - The {@link EventSubscription} for the onNotificationReceived event.
 */
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

/**
 * Called when a push notification is opened by the user.
 *
 * @param {OnNotificationOpenedCallback} callback - A {@link OnNotificationOpenedCallback} that will
 * be invoked with the result of the onNotificationOpened event.
 *  - The callback receives a single parameter:
 *     - `notification`: The {@link NotificareNotification} opened.
 * @returns {EventSubscription} - The {@link EventSubscription} for the onNotificationOpened event.
 */
export function onNotificationOpened(callback: OnNotificationOpenedCallback): EventSubscription {
  notificationOpenedCallback = callback;

  return {
    remove: () => {
      notificationOpenedCallback = undefined;
    },
  };
}

/**
 * Called when a push notification action is opened by the user.
 *
 * @param {OnNotificationActionOpenedCallback} callback - A {@link OnNotificationActionOpenedCallback}
 * that will be invoked with the result of the onNotificationActionOpened event.
 *  - The callback receives the following parameters:
 *     - `notification`: The {@link NotificareNotification} opened.
 *     - `action`: The specific action opened by the user.
 * @returns {EventSubscription} - The {@link EventSubscription} for the onNotificationActionOpened
 * event.
 */
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

/**
 * Called when a custom system notification is received.
 *
 * @param {OnSystemNotificationReceivedCallback} callback - A {@link OnSystemNotificationReceivedCallback}
 * that will be invoked with the result of the onSystemNotificationReceived event.
 *  - The callback receives a single parameter:
 *     - `notification`: The {@link NotificareSystemNotification} received.
 * @returns {EventSubscription} - The {@link EventSubscription} for the onSystemNotificationReceived
 * event.
 */
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

/**
 * Called when an unknown notification is received.
 *
 * @param {OnUnknownNotificationReceivedCallback} callback - A {@link OnUnknownNotificationReceivedCallback}
 * that will be invoked with the result of the onUnknownNotificationReceived event.
 *  - The callback receives a single parameter:
 *     - `notification`: The unknown notification received.
 * @returns {EventSubscription} - The {@link EventSubscription} for the onUnknownNotificationReceived
 * event.
 */
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
