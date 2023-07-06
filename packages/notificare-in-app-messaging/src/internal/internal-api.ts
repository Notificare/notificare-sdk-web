import {
  getCurrentDevice,
  NotificareDeviceUnavailableError,
  request,
  NotificareNetworkRequestError,
} from '@notificare/core';
import { NotificareInAppMessage } from '../models/notificare-in-app-message';
import {
  convertNetworkInAppMessageToPublic,
  NetworkInAppMessageResponse,
} from './network/responses/in-app-message-response';
import { logger } from '../logger';

export function evaluateContext(context: ApplicationContext) {
  logger.debug(`Checking in-app message for context '${context}'.`);

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

  // TODO: implementation

  logger.debug(message);
}

async function fetchInAppMessage(context: ApplicationContext): Promise<NotificareInAppMessage> {
  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  const queryParameters = new URLSearchParams({ deviceID: device.id });
  const response = await request(`/api/inappmessage/forcontext/${context}?${queryParameters}`);

  const { message }: NetworkInAppMessageResponse = await response.json();
  return convertNetworkInAppMessageToPublic(message);
}

type ApplicationContext = 'launch' | 'foreground';
