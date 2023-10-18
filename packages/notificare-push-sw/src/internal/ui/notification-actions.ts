import { NotificareNotification, NotificareNotificationAction } from '@notificare/web-core';
import { getEmailUrl, getSmsUrl, getTelephoneUrl } from '../utils';
import { presentWindowClient } from './window-client';

// Let TS know this is scoped to a service worker.
declare const self: ServiceWorkerGlobalScope;

export async function presentNotificationAction(
  notification: NotificareNotification,
  action: NotificareNotificationAction,
) {
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
  }
}

async function presentAppNotificationAction(action: NotificareNotificationAction): Promise<void> {
  if (!action.target) throw new Error('Invalid action target.');

  try {
    await self.clients.openWindow(action.target);
  } catch {
    // The promise fails when opening a deep link
    // even when it succeeds in processing it.
  }
}

async function presentBrowserNotificationAction(
  action: NotificareNotificationAction,
): Promise<void> {
  if (!action.target) throw new Error('Invalid action target.');

  await self.clients.openWindow(action.target);
}

async function presentInAppBrowserNotificationAction(
  action: NotificareNotificationAction,
): Promise<void> {
  if (!action.target) throw new Error('Invalid action target.');

  await self.clients.openWindow(action.target);
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
