import { EventSubscription, NotificareNotification } from '@notificare/core';
import { logger } from '../logger';

let notificationWillPresentCallback: OnNotificationWillPresentCallback | undefined;
let notificationPresentedCallback: OnNotificationPresentedCallback | undefined;
let notificationFinishedPresentingCallback: OnNotificationFinishedPresentingCallback | undefined;
let notificationFailedToPresentCallback: OnNotificationFailedToPresentCallback | undefined;

type OnNotificationWillPresentCallback = (notification: NotificareNotification) => void;
type OnNotificationPresentedCallback = (notification: NotificareNotification) => void;
type OnNotificationFinishedPresentingCallback = (notification: NotificareNotification) => void;
type OnNotificationFailedToPresentCallback = (notification: NotificareNotification) => void;

export function onNotificationWillPresent(
  callback: OnNotificationWillPresentCallback,
): EventSubscription {
  notificationWillPresentCallback = callback;

  return {
    remove: () => {
      notificationWillPresentCallback = undefined;
    },
  };
}

export function onNotificationPresented(
  callback: OnNotificationPresentedCallback,
): EventSubscription {
  notificationPresentedCallback = callback;

  return {
    remove: () => {
      notificationPresentedCallback = undefined;
    },
  };
}

export function onNotificationFinishedPresenting(
  callback: OnNotificationFinishedPresentingCallback,
): EventSubscription {
  notificationFinishedPresentingCallback = callback;

  return {
    remove: () => {
      notificationFinishedPresentingCallback = undefined;
    },
  };
}

export function onNotificationFailedToPresent(
  callback: OnNotificationFailedToPresentCallback,
): EventSubscription {
  notificationFailedToPresentCallback = callback;

  return {
    remove: () => {
      notificationFailedToPresentCallback = undefined;
    },
  };
}

export function notifyNotificationWillPresent(notification: NotificareNotification) {
  const callback = notificationWillPresentCallback;
  if (!callback) {
    logger.debug("The 'notification_will_present' handler is not configured.");
    return;
  }

  callback(notification);
}

export function notifyNotificationPresented(notification: NotificareNotification) {
  const callback = notificationPresentedCallback;
  if (!callback) {
    logger.debug("The 'notification_presented' handler is not configured.");
    return;
  }

  callback(notification);
}

export function notifyNotificationFinishedPresenting(notification: NotificareNotification) {
  const callback = notificationFinishedPresentingCallback;
  if (!callback) {
    logger.debug("The 'notification_finished_presenting' handler is not configured.");
    return;
  }

  callback(notification);
}

export function notifyNotificationFailedToPresent(notification: NotificareNotification) {
  const callback = notificationFailedToPresentCallback;
  if (!callback) {
    logger.debug("The 'notification_failed_to_present' handler is not configured.");
    return;
  }

  callback(notification);
}
