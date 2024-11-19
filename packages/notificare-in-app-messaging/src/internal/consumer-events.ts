import { EventSubscription } from '@notificare/web-core';
import { logger } from '../logger';
import {
  NotificareInAppMessage,
  NotificareInAppMessageAction,
} from '../models/notificare-in-app-message';

let messagePresentedCallback: OnMessagePresentedCallback | undefined;
let messageFinishedPresentingCallback: OnMessageFinishedPresentingCallback | undefined;
let messageFailedToPresentCallback: OnMessageFailedToPresentCallback | undefined;
let actionExecutedCallback: OnActionExecutedCallback | undefined;
let actionFailedToExecuteCallback: OnActionFailedToExecuteCallback | undefined;

export type OnMessagePresentedCallback = (message: NotificareInAppMessage) => void;
export type OnMessageFinishedPresentingCallback = (message: NotificareInAppMessage) => void;
export type OnMessageFailedToPresentCallback = (message: NotificareInAppMessage) => void;
export type OnActionExecutedCallback = (
  message: NotificareInAppMessage,
  action: NotificareInAppMessageAction,
) => void;
export type OnActionFailedToExecuteCallback = (
  message: NotificareInAppMessage,
  action: NotificareInAppMessageAction,
) => void;

/**
 * Called when an in-app message is successfully presented to the user.
 *
 * @param callback A {@link OnMessagePresentedCallback} that will be invoked with the result
 * of the onMessagePresented event.
 *  - The callback receives a single parameter:
 *     - `message`: The {@link NotificareInAppMessage} that was presented.
 */
export function onMessagePresented(callback: OnMessagePresentedCallback): EventSubscription {
  messagePresentedCallback = callback;

  return {
    remove: () => {
      messagePresentedCallback = undefined;
    },
  };
}

/**
 * Called when the presentation of an in-app message has finished.
 *
 * @param callback A {@link OnMessageFinishedPresentingCallback} that will be invoked with the result
 * of the onMessageFinishedPresenting event.
 *  - The callback receives a single parameter:
 *     - `message`: The {@link NotificareInAppMessage} that finished presenting.
 */
export function onMessageFinishedPresenting(
  callback: OnMessageFinishedPresentingCallback,
): EventSubscription {
  messageFinishedPresentingCallback = callback;

  return {
    remove: () => {
      messageFinishedPresentingCallback = undefined;
    },
  };
}

/**
 * Called when an in-app message failed to present.
 *
 * @param callback A {@link OnMessageFailedToPresentCallback} that will be invoked with the result
 * of the onMessageFailedToPresent event.
 *  - The callback receives a single parameter:
 *     - `message`: The {@link NotificareInAppMessage} that failed to present.
 */
export function onMessageFailedToPresent(
  callback: OnMessageFailedToPresentCallback,
): EventSubscription {
  messageFailedToPresentCallback = callback;

  return {
    remove: () => {
      messageFailedToPresentCallback = undefined;
    },
  };
}

/**
 * Called when an action is successfully executed for an in-app message.
 *
 * @param callback A {@link OnActionExecutedCallback} that will be invoked with the result
 * of the onActionExecuted event.
 * - The callback receives the following parameters:
 *     - `message`: The {@link NotificareInAppMessage} for which the action was executed.
 *     - `action`: The {@link NotificareInAppMessageAction} that was executed.
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
 * Called when an action execution failed for an in-app message.
 *
 * @param callback A {@link OnActionFailedToExecuteCallback} that will be invoked with the result
 * of the onActionFailedToExecute event.
 * - The callback receives the following parameters:
 *     - `message`: The {@link NotificareInAppMessage} for which the action was attempted.
 *     - `action`: The {@link NotificareInAppMessageAction} that failed to execute.
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

export function notifyMessagePresented(message: NotificareInAppMessage) {
  const callback = messagePresentedCallback;
  if (!callback) {
    logger.debug("The 'message_presented' handler is not configured.");
    return;
  }

  callback(message);
}

export function notifyMessageFinishedPresenting(message: NotificareInAppMessage) {
  const callback = messageFinishedPresentingCallback;
  if (!callback) {
    logger.debug("The 'message_finished_presenting' handler is not configured.");
    return;
  }

  callback(message);
}

export function notifyMessageFailedToPresent(message: NotificareInAppMessage) {
  const callback = messageFailedToPresentCallback;
  if (!callback) {
    logger.debug("The 'message_failed_to_present' handler is not configured.");
    return;
  }

  callback(message);
}

export function notifyActionExecuted(
  message: NotificareInAppMessage,
  action: NotificareInAppMessageAction,
) {
  const callback = actionExecutedCallback;
  if (!callback) {
    logger.debug("The 'action_executed' handler is not configured.");
    return;
  }

  callback(message, action);
}

export function notifyActionFailedToExecute(
  message: NotificareInAppMessage,
  action: NotificareInAppMessageAction,
) {
  const callback = actionFailedToExecuteCallback;
  if (!callback) {
    logger.debug("The 'action_failed_to_execute' handler is not configured.");
    return;
  }

  callback(message, action);
}
