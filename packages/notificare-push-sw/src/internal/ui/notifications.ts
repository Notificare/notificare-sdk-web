import {
  fetchCloudDynamicLink,
  fetchCloudPass,
  fetchCloudPassSaveLinks,
} from '@notificare/web-cloud-api';
import { NotificareNotification } from '@notificare/web-core';
import { logger } from '../../logger';
import { getCloudApiEnvironment } from '../cloud-api/environment';
import { InvalidWorkerConfigurationError } from '../configuration/errors';
import { parseWorkerConfiguration } from '../configuration/parser';
import { getCloudApiUrl, getCurrentPushToken, isAppleDevice, isSafariBrowser } from '../utils';
import { presentWindowClient } from './window-client';

// Let TS know this is scoped to a service worker.
declare const self: ServiceWorkerGlobalScope;

export async function presentNotification(notification: NotificareNotification) {
  const config = parseWorkerConfiguration();
  if (!config) throw new InvalidWorkerConfigurationError();

  if (config.standalone) {
    logger.debug('Presenting a notification in standalone mode.');
    await presentWindowClient(notification);
    return;
  }

  switch (notification.type) {
    case 're.notifica.notification.InAppBrowser':
      await presentInAppBrowserNotification(notification);
      break;
    case 're.notifica.notification.Passbook':
      await presentPassbookNotification(notification);
      break;
    case 're.notifica.notification.URLScheme':
      await presentUrlSchemeNotification(notification);
      break;
    default:
      await presentWindowClient(notification);
  }
}

async function presentInAppBrowserNotification(notification: NotificareNotification) {
  const content = notification.content.find(({ type }) => type === 're.notifica.content.URL');
  if (!content) throw new Error('Invalid notification content.');

  const url = content.data?.trim() ? content.data.trim() : '/';
  await self.clients.openWindow(url);
}

async function presentPassbookNotification(notification: NotificareNotification) {
  const content = notification.content.find(({ type }) => type === 're.notifica.content.PKPass');
  if (!content) throw new Error('Invalid notification content.');

  const passUrlStr: string = content.data;
  const components = passUrlStr.split('/');
  if (!components.length) throw new Error('Invalid notification content.');

  const id = components[components.length - 1];
  const { pass } = await fetchCloudPass({
    environment: await getCloudApiEnvironment(),
    serial: id,
  });

  if (pass.version === 2) {
    const { saveLinks } = await fetchCloudPassSaveLinks({
      environment: await getCloudApiEnvironment(),
      serial: id,
    });

    if (isAppleDevice() && isSafariBrowser() && saveLinks?.appleWallet) {
      await self.clients.openWindow(saveLinks.appleWallet);
      return;
    }

    if (saveLinks?.googlePay) {
      await self.clients.openWindow(saveLinks.googlePay);
      return;
    }
  }

  const config = parseWorkerConfiguration();
  if (!config) throw new InvalidWorkerConfigurationError();

  const cloudApiUrl = getCloudApiUrl(config);

  if (isAppleDevice() && isSafariBrowser()) {
    await self.clients.openWindow(`${cloudApiUrl}/pass/pkpass/${id}`);
    return;
  }

  await self.clients.openWindow(`${cloudApiUrl}/pass/web/${id}?showWebVersion=1`);
}

async function presentUrlSchemeNotification(notification: NotificareNotification) {
  const content = notification.content.find(({ type }) => type === 're.notifica.content.URL');
  if (!content) throw new Error('Invalid notification content.');

  if (!content.data || !content.data.trim()) {
    await self.clients.openWindow('/');
    return;
  }

  const urlStr: string = content.data.trim();
  let url: URL;

  try {
    url = new URL(urlStr);
  } catch (e) {
    logger.warning(`Unable to parse URL string '${urlStr}'.`, e);

    try {
      await self.clients.openWindow(urlStr);
    } catch {
      // The promise fails when opening a deep link
      // even when it succeeds in processing it.
    }

    return;
  }

  if (!url.host.endsWith('ntc.re')) {
    try {
      await self.clients.openWindow(urlStr);
    } catch {
      // The promise fails when opening a deep link
      // even when it succeeds in processing it.
    }

    return;
  }

  const { link } = await fetchCloudDynamicLink({
    environment: await getCloudApiEnvironment(),
    deviceId: await getCurrentPushToken(),
    url: urlStr,
  });

  try {
    await self.clients.openWindow(link.target);
  } catch {
    // The promise fails when opening a deep link
    // even when it succeeds in processing it.
  }
}
