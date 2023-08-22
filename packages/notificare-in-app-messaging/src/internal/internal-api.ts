import {
  getCurrentDevice,
  isReady,
  NotificareDeviceUnavailableError,
  NotificareNetworkRequestError,
  request,
} from '@notificare/web-core';
import { NotificareInAppMessage } from '../models/notificare-in-app-message';
import {
  convertNetworkInAppMessageToPublic,
  NetworkInAppMessageResponse,
} from './network/responses/in-app-message-response';
import { logger } from '../logger';
import { ApplicationContext } from './types/application-context';
import { ApplicationState } from './types/application-state';
import { dismissMessage, isShowingMessage, showMessage } from './ui/message-presenter';
import { notifyMessageFailedToPresent, notifyMessagePresented } from './consumer-events';
import { logInAppMessageViewed } from './internal-api-events';

const DEFAULT_BACKGROUND_GRACE_PERIOD_MILLIS = 5 * 60 * 1000;

let messagesSuppressed = false;
let applicationState = ApplicationState.BACKGROUND;
let backgroundTimestamp: number | undefined;
let delayedMessageTimeoutId: number | undefined;

export function hasMessagesSuppressed(): boolean {
  return messagesSuppressed;
}

export function setMessagesSuppressed(suppressed: boolean, evaluate?: boolean) {
  const suppressChanged = suppressed !== messagesSuppressed;
  const canEvaluate = !suppressed && suppressChanged && evaluate;

  messagesSuppressed = suppressed;

  if (canEvaluate) {
    evaluateContext('foreground');
  }
}

export function evaluateContext(context: ApplicationContext) {
  logger.debug(`Checking in-app message for context '${context}'.`);

  const device = getCurrentDevice();
  if (!device) {
    logger.warning('Cannot process in-app messages before the device is made available.');
    return;
  }

  fetchInAppMessage(context)
    .then((message) => processMessage(message))
    .catch((error) => {
      if (error instanceof NotificareNetworkRequestError && error.response.status === 404) {
        logger.debug(`There is no in-app message for '${context}' context to process.`);

        if (context === 'launch') {
          evaluateContext('foreground');
        }

        return;
      }

      logger.error(`Failed to process in-app message for context '${context}'.`, error);
    });
}

function processMessage(message: NotificareInAppMessage) {
  logger.info(`Processing in-app message '${message.name}'.`);

  if (message.delaySeconds > 0) {
    logger.debug(`Waiting ${message.delaySeconds} seconds before presenting the in-app message.`);

    // Keep a reference to the job to cancel it when the app goes into the background.
    delayedMessageTimeoutId = window.setTimeout(() => {
      presentMessage(message);
    }, message.delaySeconds * 1000);

    return;
  }

  presentMessage(message);
}

function presentMessage(message: NotificareInAppMessage) {
  if (isShowingMessage()) {
    logger.warning('Cannot display an in-app message while another is being presented.');
    notifyMessageFailedToPresent(message);
    return;
  }

  if (hasMessagesSuppressed()) {
    logger.warning('Cannot display an in-app message while messages are being suppressed.');
    notifyMessageFailedToPresent(message);
    return;
  }

  showMessage(message);
  notifyMessagePresented(message);

  logger.debug('Tracking in-app message viewed event.');
  logInAppMessageViewed(message).catch((e) =>
    logger.error('Failed to log in-app message viewed event.', e),
  );
}

async function fetchInAppMessage(context: ApplicationContext): Promise<NotificareInAppMessage> {
  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  const queryParameters = new URLSearchParams({ deviceID: device.id });
  const response = await request(`/api/inappmessage/forcontext/${context}?${queryParameters}`);

  const { message }: NetworkInAppMessageResponse = await response.json();
  return convertNetworkInAppMessageToPublic(message);
}

export function handleDocumentVisibilityChanged(visibilityState: DocumentVisibilityState) {
  if (visibilityState === 'hidden') {
    applicationState = ApplicationState.BACKGROUND;
    backgroundTimestamp = Date.now();

    if (delayedMessageTimeoutId) {
      logger.info('Clearing delayed in-app message while going to the background.');
      window.clearTimeout(delayedMessageTimeoutId);
      delayedMessageTimeoutId = undefined;
    }

    return;
  }

  // No need to run the check when we already processed the foreground check.
  if (applicationState === ApplicationState.FOREGROUND) return;

  if (isShowingMessage() && backgroundTimestamp) {
    if (Date.now() > backgroundTimestamp + DEFAULT_BACKGROUND_GRACE_PERIOD_MILLIS) {
      logger.debug('Dismiss the shown in-app message for being in the background for too long.');
      dismissMessage();
    }
  }

  applicationState = ApplicationState.FOREGROUND;
  backgroundTimestamp = undefined;

  if (!isReady()) {
    logger.debug('Postponing in-app message evaluation until Notificare is launched.');
    return;
  }

  if (isShowingMessage()) {
    logger.debug(
      'Skipping context evaluation since there is another in-app message being presented.',
    );
    return;
  }

  if (hasMessagesSuppressed()) {
    logger.debug('Skipping context evaluation since in-app messages are being suppressed.');
    return;
  }

  evaluateContext('foreground');
}
