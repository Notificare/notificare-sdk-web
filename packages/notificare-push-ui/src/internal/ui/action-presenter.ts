import {
  callNotificationWebhook,
  createNotificationReply,
  NotificareNotification,
  NotificareNotificationAction,
  NotificationReplyData,
} from '@notificare/web-core';
import { ensureCleanState } from './root';
import { logger } from '../../logger';
import { createKeyboardCallbackModal } from './actions/callback-keyboard';
import { createCameraCallbackModal } from './actions/callback-camera';
import {
  notifyActionExecuted,
  notifyActionFailedToExecute,
  notifyActionWillExecute,
  notifyCustomActionReceived,
} from '../consumer-events';
import { getEmailUrl, getSmsUrl, getTelephoneUrl } from '../utils';

export function presentAction(
  notification: NotificareNotification,
  action: NotificareNotificationAction,
) {
  ensureCleanState();

  presentActionAsync(notification, action).catch((e) =>
    logger.error('Failed to present action.', e),
  );
}

async function presentActionAsync(
  notification: NotificareNotification,
  action: NotificareNotificationAction,
) {
  logger.debug(`Presenting action '${action.type}' for notification '${notification.id}'.`);
  notifyActionWillExecute(notification, action);

  if (shouldTrackReplyBeforePresenting(action)) {
    await createNotificationReply(notification, action);
  }

  try {
    switch (action.type) {
      case 're.notifica.action.App':
        await presentApp(action);
        break;
      case 're.notifica.action.Browser':
        await presentBrowser(action);
        break;
      case 're.notifica.action.Callback':
        await presentCallback(notification, action);
        break;
      case 're.notifica.action.Custom':
        await presentCustom(notification, action);
        break;
      case 're.notifica.action.InAppBrowser':
        await presentInAppBrowser(action);
        break;
      case 're.notifica.action.Mail':
        await presentMail(action);
        break;
      case 're.notifica.action.SMS':
        await presentSms(action);
        break;
      case 're.notifica.action.Telephone':
        await presentTelephone(action);
        break;
      default:
        // noinspection ExceptionCaughtLocallyJS
        throw new Error(`Unsupported action type '${action.type}'.`);
    }

    if (requiresUserInteraction(action)) return;

    if (!shouldTrackReplyBeforePresenting(action)) {
      await createNotificationReply(notification, action);
    }

    notifyActionExecuted(notification, action);
  } catch (e) {
    logger.error('Failed to present action.', e);
    notifyActionFailedToExecute(notification, action);
  }
}

function shouldTrackReplyBeforePresenting(action: NotificareNotificationAction): boolean {
  switch (action.type) {
    case 're.notifica.action.App':
    case 're.notifica.action.Browser':
      return true;
    default:
      return false;
  }
}

function requiresUserInteraction(action: NotificareNotificationAction): boolean {
  return action.type === 're.notifica.action.Callback' && (action.camera || action.keyboard);
}

async function presentApp(action: NotificareNotificationAction): Promise<void> {
  if (!action.target) throw new Error('Invalid action target.');

  window.location.href = action.target;
}

async function presentBrowser(action: NotificareNotificationAction): Promise<void> {
  if (!action.target) throw new Error('Invalid action target.');

  window.location.href = action.target;
}

async function presentCallback(
  notification: NotificareNotification,
  action: NotificareNotificationAction,
): Promise<void> {
  if (action.camera && action.keyboard) {
    // Show the camera UI.
    document.body.appendChild(
      createCameraCallbackModal({
        hasMoreSteps: true,
        onMediaCaptured: (media, mimeType) => {
          ensureCleanState();

          // Show the keyboard UI.
          document.body.appendChild(
            createKeyboardCallbackModal({
              dismiss: () => ensureCleanState(),
              onTextCaptured: (text) => {
                processCallbackResult(notification, action, {
                  message: text,
                  media,
                  mimeType,
                }).catch((e) => logger.error('Failed to process the notification reply.', e));
              },
            }),
          );
        },
        dismiss: () => ensureCleanState(),
      }),
    );
  } else if (action.camera) {
    // Show the camera UI.
    document.body.appendChild(
      createCameraCallbackModal({
        hasMoreSteps: false,
        onMediaCaptured: (media, mimeType) => {
          processCallbackResult(notification, action, {
            media,
            mimeType,
          }).catch((e) => logger.error('Failed to process the notification reply.', e));
        },
        dismiss: () => ensureCleanState(),
      }),
    );
  } else if (action.keyboard) {
    // Show the keyboard UI.
    document.body.appendChild(
      createKeyboardCallbackModal({
        dismiss: () => ensureCleanState(),
        onTextCaptured: (text) => {
          processCallbackResult(notification, action, {
            message: text,
          }).catch((e) => logger.error('Failed to process the notification reply.', e));
        },
      }),
    );
  } else {
    processCallbackResult(notification, action).catch((e) =>
      logger.error('Failed to process the notification reply.', e),
    );
  }
}

async function processCallbackResult(
  notification: NotificareNotification,
  action: NotificareNotificationAction,
  data?: NotificationReplyData,
): Promise<void> {
  try {
    if (action.target) {
      await callNotificationWebhook(notification, action);
    }

    if (requiresUserInteraction(action)) {
      await createNotificationReply(notification, action, data);
    }

    notifyActionExecuted(notification, action);
  } catch (e) {
    notifyActionFailedToExecute(notification, action);
  }

  ensureCleanState();
}

async function presentCustom(
  notification: NotificareNotification,
  action: NotificareNotificationAction,
): Promise<void> {
  if (!action.target) throw new Error('Invalid action target.');

  notifyCustomActionReceived(notification, action, action.target);
}

async function presentInAppBrowser(action: NotificareNotificationAction): Promise<void> {
  if (!action.target) throw new Error('Invalid action target.');

  window.open(action.target);
}

async function presentMail(action: NotificareNotificationAction): Promise<void> {
  if (!action.target) throw new Error('Invalid action target.');

  window.location.href = getEmailUrl(action.target);
}

async function presentSms(action: NotificareNotificationAction): Promise<void> {
  if (!action.target) throw new Error('Invalid action target.');

  window.location.href = getSmsUrl(action.target);
}

async function presentTelephone(action: NotificareNotificationAction): Promise<void> {
  if (!action.target) throw new Error('Invalid action target.');

  window.location.href = getTelephoneUrl(action.target);
}
