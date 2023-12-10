import { NotificareNotification, NotificareNotificationAction } from '@notificare/web-core';
import { logger } from '../../logger';
import { getClientState, setClientState } from '../client-state';
import { sleep } from '../utils';

// Let TS know this is scoped to a service worker.
declare const self: ServiceWorkerGlobalScope;

export async function presentWindowClient(
  notification: NotificareNotification,
  action?: NotificareNotificationAction,
) {
  const client = await ensureOpenWindowClient();

  logger.debug('Sending notification clicked event to window client.');
  client.postMessage({
    cmd: 're.notifica.push.sw.notification_clicked',
    content: {
      notification,
      action,
    },
  });

  try {
    await client.focus();
  } catch (e) {
    logger.error('Failed to focus client: ', client, e);
  }
}

export async function ensureOpenWindowClient(): Promise<WindowClient> {
  logger.debug('Searching for a ready window client.');
  const clients = await self.clients.matchAll({ type: 'window' });
  if (clients.length) {
    logger.debug(`Found ${clients.length} open clients. Client state is '${getClientState()}'.`);
    if (getClientState() === 'ready') {
      return clients[0];
    }

    return waitForOpenWindowClient();
  }

  // Reset the readiness state in case the service worker instance is reused across
  // application restarts, when it used to be ready.
  logger.debug('Resetting the client state.');
  setClientState('unready');

  logger.debug('Opening a new window client.');
  self.clients.openWindow('/').catch((e) => logger.error('Unable to open a window client.', e));

  return waitForOpenWindowClient();
}

async function waitForOpenWindowClient(): Promise<WindowClient> {
  logger.debug('Waiting for an open window client.');

  const clients = await self.clients.matchAll({ type: 'window' });
  if (clients.length && getClientState() === 'ready') return clients[0];

  await sleep(1000);
  return waitForOpenWindowClient();
}
