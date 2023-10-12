import { logger } from '../../logger';
import { sleep } from '../utils';
import { getClientState, setClientState } from '../client-state';

// Let TS know this is scoped to a service worker.
declare const self: ServiceWorkerGlobalScope;

export async function onNotificationClick(event: NotificationEvent) {
  event.notification.close();

  await ensureOpenWindowClient();

  const clients = await self.clients.matchAll({ type: 'window' });
  if (!clients.length) {
    logger.error('Unable to process the notification click without an active client.');
    throw new Error('Unable to process the notification click without an active client.');
  }

  const client = clients[0];

  if (event.action) {
    client.postMessage({
      cmd: 're.notifica.push.sw.notification_reply',
      notification: event.notification.data,
      action: event.action,
    });
  } else {
    client.postMessage({
      cmd: 're.notifica.push.sw.notification_clicked',
      notification: event.notification.data,
    });
  }

  try {
    await client.focus();
  } catch (e) {
    logger.error('Failed to focus client: ', client, e);
  }
}

async function ensureOpenWindowClient() {
  const clients = await self.clients.matchAll({ type: 'window' });
  if (clients.length) {
    if (getClientState() === 'ready') return;

    await waitForOpenWindowClient();
    return;
  }

  // Reset the readiness state in case the service worker instance is reused across
  // application restarts, when it used to be ready.
  setClientState('unready');

  // const url = event.notification.data.urlFormatString.replace("%@", event.notification.tag);
  await self.clients.openWindow('/');
  await waitForOpenWindowClient();
}

async function waitForOpenWindowClient() {
  const clients = await self.clients.matchAll({ type: 'window' });
  if (clients.length && getClientState() === 'ready') return;

  await sleep(1000);
  await waitForOpenWindowClient();
}
