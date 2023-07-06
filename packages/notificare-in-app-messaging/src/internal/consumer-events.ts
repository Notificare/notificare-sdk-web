import { EventSubscription } from '@notificare/core';
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

type OnMessagePresentedCallback = (message: NotificareInAppMessage) => void;
type OnMessageFinishedPresentingCallback = (message: NotificareInAppMessage) => void;
type OnMessageFailedToPresentCallback = (message: NotificareInAppMessage) => void;
type OnActionExecutedCallback = (
  message: NotificareInAppMessage,
  action: NotificareInAppMessageAction,
) => void;
type OnActionFailedToExecuteCallback = (
  message: NotificareInAppMessage,
  action: NotificareInAppMessageAction,
) => void;

export function onMessagePresented(callback: OnMessagePresentedCallback): EventSubscription {
  messagePresentedCallback = callback;

  return {
    remove: () => {
      messagePresentedCallback = undefined;
    },
  };
}

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
