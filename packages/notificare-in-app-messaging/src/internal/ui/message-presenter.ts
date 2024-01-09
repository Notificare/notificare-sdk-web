import { logger } from '../../logger';
import {
  NotificareInAppMessage,
  NotificareInAppMessageAction,
} from '../../models/notificare-in-app-message';
import {
  notifyActionExecuted,
  notifyActionFailedToExecute,
  notifyMessageFinishedPresenting,
} from '../consumer-events';
import { logInAppMessageActionClicked } from '../internal-api-events';
import { ActionType } from '../types/action-type';
import { MessageType } from '../types/message-type';
import { createBannerComponent } from './components/banner';
import { createCardComponent } from './components/card';
import { createFullscreenComponent } from './components/fullscreen';
import { ensureCleanState } from './root';

let shownMessage: NotificareInAppMessage | undefined;

export function isShowingMessage(): boolean {
  return shownMessage != null;
}

export function showMessage(message: NotificareInAppMessage) {
  shownMessage = message;

  let element: HTMLElement | undefined;

  switch (message.type) {
    case MessageType.BANNER: {
      element = createBannerComponent({
        message,
        dismiss: () => dismissMessage(),
        executeAction: (type) => presentAction(message, type),
      });
      break;
    }
    case MessageType.CARD: {
      element = createCardComponent({
        message,
        dismiss: () => dismissMessage(),
        executeAction: (type) => presentAction(message, type),
      });
      break;
    }
    case MessageType.FULLSCREEN: {
      element = createFullscreenComponent({
        message,
        dismiss: () => dismissMessage(),
        executeAction: (type) => presentAction(message, type),
      });
      break;
    }
    default:
      throw new Error(`Unsupported in-app message type '${message.type}'.`);
  }

  document.body.appendChild(element);
}

export function dismissMessage() {
  const currentMessage = shownMessage;

  if (!currentMessage) {
    logger.debug('There is no in-app message to dismiss.');
    return;
  }

  ensureCleanState();
  shownMessage = undefined;

  notifyMessageFinishedPresenting(currentMessage);
}

function presentAction(message: NotificareInAppMessage, type: ActionType) {
  let action: NotificareInAppMessageAction | undefined;

  switch (type) {
    case ActionType.PRIMARY:
      action = message.primaryAction;
      break;
    case ActionType.SECONDARY:
      action = message.secondaryAction;
      break;
    default:
      throw new Error(`Unsupported action type '${type}'.`);
  }

  if (!action) {
    logger.debug(`There is no '${type}' action to process.`);
    dismissMessage();
    return;
  }

  const url = action.url?.trim();

  if (!url) {
    logger.debug(`There is no URL for '${type}' action.`);
    dismissMessage();
    return;
  }

  logInAppMessageActionClicked(message, type)
    .then(() => logger.debug('In-app message action event tracked.'))
    .catch((error) => logger.error('Failed to log in-app message action.', error));

  try {
    window.location.href = url;

    notifyActionExecuted(message, action);
  } catch (e) {
    notifyActionFailedToExecute(message, action);
  }

  dismissMessage();
}
