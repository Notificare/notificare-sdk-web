import {
  getCurrentDevice,
  NotificareNotification,
  NotificareNotificationAction,
  request,
} from '@notificare/core';
import { logger } from '../logger';
import { getEmailUrl, getSmsUrl, getTelephoneUrl } from './utils';
import {
  notifyActionExecuted,
  notifyActionFailedToExecute,
  notifyActionWillExecute,
  notifyCustomActionReceived,
} from './consumer-events';
import { createCallbackUserInterface } from './ui/actions/callback-modal';

export function presentActionInternal(
  notification: NotificareNotification,
  action: NotificareNotificationAction,
) {
  let executor: ActionExecutor;

  try {
    executor = createActionExecutor(notification, action);
  } catch (e) {
    notifyActionFailedToExecute(notification, action);
    return;
  }

  processActionExecutor(executor).catch((e) => logger.error('Something went wrong: ', e));
}

function createActionExecutor(
  notification: NotificareNotification,
  action: NotificareNotificationAction,
): ActionExecutor {
  switch (action.type) {
    case 're.notifica.action.App':
      return {
        notification,
        action,
        mode: 'reply-before-execution',
        execute: () => presentApp(notification, action),
      };

    case 're.notifica.action.Browser':
      return {
        notification,
        action,
        mode: 'reply-before-execution',
        execute: () => presentBrowser(notification, action),
      };

    case 're.notifica.action.Callback':
      return {
        notification,
        action,
        mode: 'multi-step',
        execute: () => presentCallback(notification, action),
      };

    case 're.notifica.action.Custom':
      return {
        notification,
        action,
        mode: 'default',
        execute: () => presentCustom(notification, action),
      };

    case 're.notifica.action.InAppBrowser':
      return {
        notification,
        action,
        mode: 'default',
        execute: () => presentInAppBrowser(notification, action),
      };

    case 're.notifica.action.Mail':
      return {
        notification,
        action,
        mode: 'default',
        execute: () => presentMail(notification, action),
      };

    case 're.notifica.action.SMS':
      return {
        notification,
        action,
        mode: 'default',
        execute: () => presentSms(notification, action),
      };

    case 're.notifica.action.Telephone':
      return {
        notification,
        action,
        mode: 'default',
        execute: () => presentTelephone(notification, action),
      };

    default:
      throw new Error(`Unsupported action type '${action.type}'.`);
  }
}

async function processActionExecutor({
  notification,
  action,
  execute,
  mode,
}: ActionExecutor): Promise<void> {
  logger.debug(
    `Presenting notification action '${action.type}' for notification '${notification.id}'.`,
  );

  notifyActionWillExecute(notification, action);

  try {
    if (mode === 'reply-before-execution') {
      await reply(notification, action);
    }

    await execute();

    if (mode === 'default') {
      await reply(notification, action);
    }

    if (mode === 'default' || mode === 'reply-before-execution') {
      notifyActionExecuted(notification, action);
    }
  } catch (e) {
    notifyActionFailedToExecute(notification, action);
  }
}

async function presentApp(
  notification: NotificareNotification,
  action: NotificareNotificationAction,
): Promise<void> {
  if (!action.target) throw new Error('Invalid action target.');

  window.location.href = action.target;
}

async function presentBrowser(
  notification: NotificareNotification,
  action: NotificareNotificationAction,
): Promise<void> {
  if (!action.target) throw new Error('Invalid action target.');

  window.location.href = action.target;
}

async function presentCallback(
  notification: NotificareNotification,
  action: NotificareNotificationAction,
): Promise<void> {
  if (action.camera && action.keyboard && !action.target) {
    // camera & keyboard
  } else if (action.camera && !action.keyboard && !action.target) {
    // camera
    const ui = await createCallbackUserInterface();
    document.body.appendChild(ui);
  } else if (!action.camera && action.keyboard && !action.target) {
    // keyboard
  } else if (action.target) {
    // webhook
    await replyWebhook(notification, action);
    await reply(notification, action);
  } else {
    // standard reply
    // await reply(notification, action);
  }

  /*
                if (action.camera && action.keyboard && !action.target) {

                    this._replyWithCameraAndKeyboard(notification, action, data);

                } else if (action.camera && !action.keyboard && !action.target) {

                    this._replyWithCamera(notification, action, data);

                } else if (!action.camera && action.keyboard && !action.target) {

                    this._replyWithKeyboard(notification, action, data);

                } else {

                    if (action.target) {
                        this._replyWithTarget(notification, action, data);
                    } else {
                        this._handleReply(notification, action, null);
                    }

                }
   */
}

async function presentCustom(
  notification: NotificareNotification,
  action: NotificareNotificationAction,
): Promise<void> {
  if (!action.target) throw new Error('');

  notifyCustomActionReceived(notification, action, action.target);
}

async function presentInAppBrowser(
  notification: NotificareNotification,
  action: NotificareNotificationAction,
): Promise<void> {
  if (!action.target) throw new Error('Invalid action target.');

  window.open(action.target);
}

async function presentMail(
  notification: NotificareNotification,
  action: NotificareNotificationAction,
): Promise<void> {
  if (!action.target) throw new Error('Invalid action target.');

  window.location.href = getEmailUrl(action.target);
}

async function presentSms(
  notification: NotificareNotification,
  action: NotificareNotificationAction,
): Promise<void> {
  if (!action.target) throw new Error('Invalid action target.');

  window.location.href = getSmsUrl(action.target);
}

async function presentTelephone(
  notification: NotificareNotification,
  action: NotificareNotificationAction,
): Promise<void> {
  if (!action.target) throw new Error('Invalid action target.');

  window.location.href = getTelephoneUrl(action.target);
}

async function reply(
  notification: NotificareNotification,
  action: NotificareNotificationAction,
): Promise<void> {
  const device = getCurrentDevice();
  if (!device) logger.warning('Device unavailable when processing a notification reply.');

  await request('/reply', {
    method: 'POST',
    body: {
      deviceID: device?.id,
      userID: device?.userId,
      notification: notification.id,
      label: action.label,
    },
  });
}

async function replyWebhook(
  notification: NotificareNotification,
  action: NotificareNotificationAction,
): Promise<void> {
  if (!action.target) throw new Error('Unable to execute webhook without a target for the action.');

  const url = new URL(action.target);

  const device = getCurrentDevice();
  const data: Record<string, string> = {};

  // Populate the data with the target's query parameters.
  url.searchParams.forEach((key) => {
    const value = url.searchParams.get(key);
    if (value) data[key] = value;
  });

  data.target = url.origin;
  data.label = action.label;
  data.notificationID = notification.id;
  if (device?.id) data.deviceID = device.id;
  if (device?.userId) data.userID = device.userId;

  await request('/api/reply/webhook', {
    method: 'POST',
    body: data,
  });
}

interface ActionExecutor {
  readonly notification: NotificareNotification;
  readonly action: NotificareNotificationAction;
  readonly mode: 'default' | 'reply-before-execution' | 'multi-step';
  readonly execute: () => Promise<void>;
}
