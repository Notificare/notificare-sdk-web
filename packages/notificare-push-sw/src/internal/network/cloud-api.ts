import {
  convertNetworkNotificationToPublic,
  NetworkNotificationResponse,
  NotificareNotification,
  NotificareNotificationAction,
} from '@notificare/web-core';
import { workerRequest } from './worker-request';
import { parseWorkerConfiguration } from '../configuration/parser';
import { getCurrentPushToken } from '../utils';
import { InvalidWorkerConfigurationError } from '../configuration/errors';
import {
  NetworkDynamicLink,
  NetworkDynamicLinkResponse,
  NetworkPass,
  NetworkPassResponse,
  NetworkSaveLinks,
  NetworkSaveLinksResponse,
} from './cloud-api-models';

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

export async function logNotificationOpen(id: string) {
  await logInternalEvent({
    type: 're.notifica.event.notification.Open',
    notificationId: id,
  });
}

export async function logNotificationInfluenced(id: string) {
  await logInternalEvent({
    type: 're.notifica.event.notification.Influenced',
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

export async function fetchDynamicLink(url: string): Promise<NetworkDynamicLink> {
  const config = parseWorkerConfiguration();
  if (!config) throw new InvalidWorkerConfigurationError();

  const deviceId = await getCurrentPushToken();
  if (!deviceId) throw new Error('Unable to acquire the device id.');

  const searchParams = new URLSearchParams();
  searchParams.set('platform', 'Web');
  searchParams.set('deviceID', deviceId);

  const response = await workerRequest({
    config,
    url: `/api/link/dynamic/${encodeURIComponent(url)}?${searchParams}`,
  });

  const { link }: NetworkDynamicLinkResponse = await response.json();
  return link;
}

export async function fetchPass(serial: string): Promise<NetworkPass> {
  const config = parseWorkerConfiguration();
  if (!config) throw new InvalidWorkerConfigurationError();

  const response = await workerRequest({
    config,
    url: `/api/pass/forserial/${encodeURIComponent(serial)}`,
  });

  const { pass }: NetworkPassResponse = await response.json();
  return pass;
}

export async function fetchPassSaveLinks(serial: string): Promise<NetworkSaveLinks | undefined> {
  const config = parseWorkerConfiguration();
  if (!config) throw new InvalidWorkerConfigurationError();

  const response = await workerRequest({
    config,
    url: `/api/pass/savelinks/${encodeURIComponent(serial)}`,
  });

  const { saveLinks }: NetworkSaveLinksResponse = await response.json();
  return saveLinks;
}

export async function createNotificationReply({
  notification,
  action,
}: CreateNotificationReplyParams) {
  const config = parseWorkerConfiguration();
  if (!config) throw new InvalidWorkerConfigurationError();

  const deviceId = await getCurrentPushToken();
  if (!deviceId) throw new Error('Unable to acquire the device id.');

  await workerRequest({
    config,
    url: '/api/reply',
    method: 'POST',
    body: {
      notification: notification.id,
      deviceID: deviceId,
      label: action.label,
      data: {
        target: action.target,
      },
    },
  });
}

interface CreateNotificationReplyParams {
  notification: NotificareNotification;
  action: NotificareNotificationAction;
}
