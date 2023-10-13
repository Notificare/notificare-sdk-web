import { logger } from '../../logger';
import { sleep } from '../utils';
import { getClientState, setClientState } from '../client-state';

// Let TS know this is scoped to a service worker.
declare const self: ServiceWorkerGlobalScope;

export async function onNotificationClick(event: NotificationEvent) {
  event.notification.close();

  const client = await ensureOpenWindowClient();

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

async function ensureOpenWindowClient(): Promise<WindowClient> {
  const clients = await self.clients.matchAll({ type: 'window' });
  if (clients.length) {
    if (getClientState() === 'ready') {
      return clients[0];
    }

    return waitForOpenWindowClient();
  }

  // Reset the readiness state in case the service worker instance is reused across
  // application restarts, when it used to be ready.
  setClientState('unready');

  // const url = event.notification.data.urlFormatString.replace("%@", event.notification.tag);
  await self.clients.openWindow('/');
  return waitForOpenWindowClient();
}

async function waitForOpenWindowClient(): Promise<WindowClient> {
  const clients = await self.clients.matchAll({ type: 'window' });
  if (clients.length && getClientState() === 'ready') return clients[0];

  await sleep(1000);
  return waitForOpenWindowClient();
}
