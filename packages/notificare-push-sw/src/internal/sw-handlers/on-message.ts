import { logger } from '../../logger';
import { setClientState } from '../client-state';

// Let TS know this is scoped to a service worker.
// declare const self: ServiceWorkerGlobalScope;

export function onMessage(event: ExtendableMessageEvent) {
  if (!event.data) return;

  try {
    switch (event.data.action) {
      case 're.notifica.ready':
        setClientState('ready');
        break;
      default:
        logger.warning('Unknown service worker message event: ', event);
    }
  } catch (e) {
    logger.error('Failed to process a service worker message event: ', e);
  }
}
