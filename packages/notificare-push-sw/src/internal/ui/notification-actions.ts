import { createCloudNotificationReply } from '@notificare/web-cloud-api';
import { NotificareNotification, NotificareNotificationAction } from '@notificare/web-core';
import { logger } from '../../logger';
import { getCloudApiEnvironment } from '../cloud-api/environment';
import { InvalidWorkerConfigurationError } from '../configuration/errors';
import { getCurrentDeviceId, parseWorkerConfiguration } from '../configuration/parser';
import { getEmailUrl, getSmsUrl, getTelephoneUrl } from '../utils';
import { presentWindowClient } from './window-client';

// Let TS know this is scoped to a service worker.
declare const self: ServiceWorkerGlobalScope;

export async function presentNotificationAction(
  notification: NotificareNotification,
  action: NotificareNotificationAction,
) {
  const config = parseWorkerConfiguration();
  if (!config) throw new InvalidWorkerConfigurationError();

  if (config.standalone) {
    logger.debug('Presenting a notification action in standalone mode.');
    await presentWindowClient(notification, action);
    return;
  }

  switch (action.type) {
    case 're.notifica.action.App':
      await presentAppNotificationAction(action);
      break;
    case 're.notifica.action.Browser':
      await presentBrowserNotificationAction(action);
      break;
    case 're.notifica.action.InAppBrowser':
      await presentInAppBrowserNotificationAction(action);
      break;
    case 're.notifica.action.Mail':
      await presentMailNotificationAction(action);
      break;
    case 're.notifica.action.SMS':
      await presentSmsNotificationAction(action);
      break;
    case 're.notifica.action.Telephone':
      await presentTelephoneNotificationAction(action);
      break;
    default:
      await presentWindowClient(notification, action);
      return;
  }

  await createNotificationReply(notification, action);
}

async function presentAppNotificationAction(action: NotificareNotificationAction): Promise<void> {
  try {
    const urlStr = action.target?.trim() ? action.target.trim() : '/';
    await self.clients.openWindow(urlStr);
  } catch {
    // The promise fails when opening a deep link
    // even when it succeeds in processing it.
  }
}

async function presentBrowserNotificationAction(
  action: NotificareNotificationAction,
): Promise<void> {
  const urlStr = action.target?.trim() ? action.target.trim() : '/';
  await self.clients.openWindow(urlStr);
}

async function presentInAppBrowserNotificationAction(
  action: NotificareNotificationAction,
): Promise<void> {
  const urlStr = action.target?.trim() ? action.target.trim() : '/';
  await self.clients.openWindow(urlStr);
}

async function presentMailNotificationAction(action: NotificareNotificationAction): Promise<void> {
  if (!action.target) throw new Error('Invalid action target.');

  try {
    await self.clients.openWindow(getEmailUrl(action.target));
  } catch {
    // The promise fails when opening a deep link
    // even when it succeeds in processing it.
  }
}

async function presentSmsNotificationAction(action: NotificareNotificationAction): Promise<void> {
  if (!action.target) throw new Error('Invalid action target.');

  try {
    await self.clients.openWindow(getSmsUrl(action.target));
  } catch {
    // The promise fails when opening a deep link
    // even when it succeeds in processing it.
  }
}

async function presentTelephoneNotificationAction(
  action: NotificareNotificationAction,
): Promise<void> {
  if (!action.target) throw new Error('Invalid action target.');

  try {
    await self.clients.openWindow(getTelephoneUrl(action.target));
  } catch {
    // The promise fails when opening a deep link
    // even when it succeeds in processing it.
  }
}

export async function createNotificationReply(
  notification: NotificareNotification,
  action: NotificareNotificationAction,
) {
  await createCloudNotificationReply({
    environment: await getCloudApiEnvironment(),
    payload: {
      notification: notification.id,
      label: action.label,
      deviceID: getCurrentDeviceId(),
      data: {
        target: action.target,
      },
    },
  });
}
