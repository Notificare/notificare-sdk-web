import {
  EventSubscription,
  NotificareNotification,
  NotificareNotificationAction,
} from '@notificare/web-core';
import { logger } from '../logger';

let notificationWillPresentCallback: OnNotificationWillPresentCallback | undefined;
let notificationPresentedCallback: OnNotificationPresentedCallback | undefined;
let notificationFinishedPresentingCallback: OnNotificationFinishedPresentingCallback | undefined;
let notificationFailedToPresentCallback: OnNotificationFailedToPresentCallback | undefined;
let actionWillExecuteCallback: OnActionWillExecuteCallback | undefined;
let actionExecutedCallback: OnActionExecutedCallback | undefined;
let actionFailedToExecuteCallback: OnActionFailedToExecuteCallback | undefined;
let customActionReceivedCallback: OnCustomActionReceivedCallback | undefined;

export type OnNotificationWillPresentCallback = (notification: NotificareNotification) => void;
export type OnNotificationPresentedCallback = (notification: NotificareNotification) => void;
export type OnNotificationFinishedPresentingCallback = (
  notification: NotificareNotification,
) => void;
export type OnNotificationFailedToPresentCallback = (notification: NotificareNotification) => void;
export type OnActionWillExecuteCallback = (
  notification: NotificareNotification,
  action: NotificareNotificationAction,
) => void;
export type OnActionExecutedCallback = (
  notification: NotificareNotification,
  action: NotificareNotificationAction,
) => void;
export type OnActionFailedToExecuteCallback = (
  notification: NotificareNotification,
  action: NotificareNotificationAction,
) => void;
export type OnCustomActionReceivedCallback = (
  notification: NotificareNotification,
  action: NotificareNotificationAction,
  target: string,
) => void;

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

export function onActionWillExecute(callback: OnActionWillExecuteCallback): EventSubscription {
  actionWillExecuteCallback = callback;

  return {
    remove: () => {
      actionWillExecuteCallback = undefined;
    },
  };
}

export function onActionExecuted(callback: OnActionExecutedCallback): EventSubscription {
  actionExecutedCallback = callback;

  return {
    remove: () => {
      actionExecutedCallback = undefined;
    },
  };
}

export function onActionFailedToExecute(
  callback: OnActionFailedToExecuteCallback,
): EventSubscription {
  actionFailedToExecuteCallback = callback;

  return {
    remove: () => {
      actionFailedToExecuteCallback = undefined;
    },
  };
}

export function onCustomActionReceived(
  callback: OnCustomActionReceivedCallback,
): EventSubscription {
  customActionReceivedCallback = callback;

  return {
    remove: () => {
      customActionReceivedCallback = undefined;
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

export function notifyActionWillExecute(
  notification: NotificareNotification,
  action: NotificareNotificationAction,
) {
  const callback = actionWillExecuteCallback;
  if (!callback) {
    logger.debug("The 'action_will_execute' handler is not configured.");
    return;
  }

  callback(notification, action);
}

export function notifyActionExecuted(
  notification: NotificareNotification,
  action: NotificareNotificationAction,
) {
  const callback = actionExecutedCallback;
  if (!callback) {
    logger.debug("The 'action_executed' handler is not configured.");
    return;
  }

  callback(notification, action);
}

export function notifyActionFailedToExecute(
  notification: NotificareNotification,
  action: NotificareNotificationAction,
) {
  const callback = actionFailedToExecuteCallback;
  if (!callback) {
    logger.debug("The 'action_failed_to_execute' handler is not configured.");
    return;
  }

  callback(notification, action);
}

export function notifyCustomActionReceived(
  notification: NotificareNotification,
  action: NotificareNotificationAction,
  target: string,
) {
  const callback = customActionReceivedCallback;
  if (!callback) {
    logger.debug("The 'custom_action_received' handler is not configured.");
    return;
  }

  callback(notification, action, target);
}
