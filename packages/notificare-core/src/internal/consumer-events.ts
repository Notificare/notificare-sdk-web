import { NotificareApplication } from '../models/notificare-application';
import { EventSubscription } from '../event-subscription';
import { logger } from './logger';

let onReadyCallback: OnReadyCallback | undefined;

type OnReadyCallback = (application: NotificareApplication) => void;

export function onReady(callback: OnReadyCallback): EventSubscription {
  onReadyCallback = callback;

  return {
    remove: () => {
      onReadyCallback = undefined;
    },
  };
}

export function notifyOnReady(application: NotificareApplication) {
  const callback = onReadyCallback;
  if (!callback) {
    logger.debug("The 'on_ready' handler is not configured.");
    return;
  }

  callback(application);
}
