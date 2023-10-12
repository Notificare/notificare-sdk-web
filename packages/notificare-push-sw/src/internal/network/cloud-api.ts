import {
  convertNetworkNotificationToPublic,
  NetworkNotificationResponse,
  NotificareNotification,
} from '@notificare/web-core';
import { workerRequest } from './worker-request';
import { parseWorkerConfiguration } from '../configuration/parser';
import { getCurrentPushToken } from '../utils';
import { InvalidWorkerConfigurationError } from '../configuration/errors';

export async function fetchNotification(id: string): Promise<NotificareNotification> {
  const config = parseWorkerConfiguration();
  if (!config) throw new InvalidWorkerConfigurationError();

  const response = await workerRequest({
    config,
    url: `/api/notification/${encodeURIComponent(id)}`,
  });

  const { notification }: NetworkNotificationResponse = await response.json();
  return convertNetworkNotificationToPublic(notification);
}

export async function logNotificationReceived(id: string) {
  await logInternalEvent({
    type: 're.notifica.event.notification.Receive',
    notificationId: id,
  });
}

export async function logNotificationOpened(id: string) {
  await logInternalEvent({
    type: 're.notifica.event.notification.Open',
    notificationId: id,
  });
}

async function logInternalEvent({ type, notificationId, data }: LogInternalEventParams) {
  const config = parseWorkerConfiguration();
  if (!config) throw new InvalidWorkerConfigurationError();

  const deviceId = await getCurrentPushToken();

  await workerRequest({
    config,
    method: 'POST',
    url: '/api/event',
    body: {
      type,
      timestamp: Date.now(),
      deviceID: deviceId,
      // userID: currentDevice?.userId,
      // sessionID: options.sessionId ?? getSession()?.id,
      notification: notificationId,
      data,
    },
  });
}

interface LogInternalEventParams {
  type: string;
  notificationId?: string;
  data?: unknown;
}
