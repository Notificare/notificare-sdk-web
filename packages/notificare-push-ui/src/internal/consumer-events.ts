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

/**
 * Called when a notification is about to be presented.
 *
 * This method is invoked before the notification is shown to the user.
 *
 * @param {OnNotificationWillPresentCallback} callback - A {@link OnNotificationWillPresentCallback}
 * that will be invoked with the result of the onNotificationWillPresent event.
 *  - The callback receives a single parameter:
 *     - `notification`: The {@link NotificareNotification} that will be presented.
 * @returns {EventSubscription} - The {@link EventSubscription} for the onNotificationWillPresent
 * event.
 */
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

/**
 * Called when a notification has been presented.
 *
 * This method is triggered when the notification has been shown to the user.
 *
 * @param {OnNotificationPresentedCallback} callback - A {@link OnNotificationPresentedCallback}
 * that will be invoked with the result of the onNotificationPresented event.
 *  - The callback receives a single parameter:
 *     - `notification`: The {@link NotificareNotification} presented.
 * @returns {EventSubscription} - The {@link EventSubscription} for the onNotificationPresented event.
 */
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

/**
 * Called when the presentation of a notification has finished.
 *
 * This method is invoked after the notification UI has been dismissed or the notification
 * interaction has completed.
 *
 * @param {OnNotificationFinishedPresentingCallback} callback - A {@link OnNotificationFinishedPresentingCallback}
 * that will be invoked with the result of the onNotificationFinishedPresenting event.
 *  - The callback receives a single parameter:
 *     - `notification`: The {@link NotificareNotification} that finished presenting.
 * @returns {EventSubscription} - The {@link EventSubscription} for the onNotificationFinishedPresenting
 * event.
 */
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

/**
 * Called when a notification fails to present.
 *
 * This method is invoked if there is an error preventing the notification from being presented.
 *
 * @param {OnNotificationFailedToPresentCallback} callback - A {@link OnNotificationFailedToPresentCallback}
 * that will be invoked with the result of the onNotificationFailedToPresent event.
 *  - The callback receives a single parameter:
 *     - `notification`: The {@link NotificareNotification} that failed to present.
 * @returns {EventSubscription} - The {@link EventSubscription} for the onNotificationFailedToPresent
 * event.
 */
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

/**
 * Called when an action associated with a notification is about to execute.
 *
 * This method is invoked right before the action associated with a notification is executed.
 *
 * @param {OnActionWillExecuteCallback} callback - A {@link OnActionWillExecuteCallback} that will
 * be invoked with the result of the onActionWillExecute event.
 *  - The callback receives the following parameters:
 *     - `notification`: The {@link NotificareNotification} containing the action.
 *     - `action`: The {@link NotificareNotificationAction} that will be executed.
 * @returns {EventSubscription} - The {@link EventSubscription} for the onActionWillExecute event.
 */
export function onActionWillExecute(callback: OnActionWillExecuteCallback): EventSubscription {
  actionWillExecuteCallback = callback;

  return {
    remove: () => {
      actionWillExecuteCallback = undefined;
    },
  };
}

/**
 * Called when an action associated with a notification has been executed.
 *
 * This method is triggered after the action associated with the notification has been successfully
 * executed.
 *
 * @param {OnActionExecutedCallback} callback - A {@link OnActionExecutedCallback} that will be
 * invoked with the result of the onActionExecuted event.
 *  - The callback receives the following parameters:
 *     - `notification`: The {@link NotificareNotification} containing the action.
 *     - `action`: The {@link NotificareNotificationAction} that was executed.
 * @returns {EventSubscription} - The {@link EventSubscription} for the onActionExecuted event.
 */
export function onActionExecuted(callback: OnActionExecutedCallback): EventSubscription {
  actionExecutedCallback = callback;

  return {
    remove: () => {
      actionExecutedCallback = undefined;
    },
  };
}

/**
 * Called when an action associated with a notification fails to execute.
 *
 * This method is triggered if an error occurs while trying to execute an action associated with the
 * notification.
 *
 * @param {OnActionFailedToExecuteCallback} callback - A {@link OnActionFailedToExecuteCallback}
 * that will be invoked with the result of the onActionFailedToExecute event.
 *  - The callback receives the following parameters:
 *     - `notification`: The {@link NotificareNotification} containing the action.
 *     - `action`: The {@link NotificareNotificationAction} that failed to execute.
 * @returns {EventSubscription} - The {@link EventSubscription} for the onActionFailedToExecute event.
 */
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

/**
 * Called when a custom action associated with a notification is received.
 *
 * This method is triggered when a custom action associated with the notification is received,
 * such as a deep link or custom URL scheme.
 *
 * @param {OnCustomActionReceivedCallback} callback - A {@link OnCustomActionReceivedCallback} that
 * will be invoked with the result of the onCustomActionReceived event.
 *  - The callback receives the following parameters:
 *     - `notification`: The {@link NotificareNotification} containing the action.
 *     - `action`: The {@link NotificareNotificationAction} that failed to execute.
 *     - `target`: The url representing the custom action.
 * @returns {EventSubscription} - The {@link EventSubscription} for the onCustomActionReceived event.
 */
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
