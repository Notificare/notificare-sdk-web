import { NotificareApplication } from '../models/notificare-application';
import { EventSubscription } from '../event-subscription';
import { logger } from './logger';

let onReadyCallback: OnReadyCallback | undefined;
let unlaunchedCallback: OnUnlaunchedCallback | undefined;

type OnReadyCallback = (application: NotificareApplication) => void;
type OnUnlaunchedCallback = () => void;

export function onReady(callback: OnReadyCallback): EventSubscription {
  onReadyCallback = callback;

  return {
    remove: () => {
      onReadyCallback = undefined;
    },
  };
}

export function onUnlaunched(callback: OnUnlaunchedCallback): EventSubscription {
  unlaunchedCallback = callback;

  return {
    remove: () => {
      unlaunchedCallback = undefined;
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

export function notifyUnlaunched() {
  const callback = unlaunchedCallback;
  if (!callback) {
    logger.debug("The 'on_unlaunched' handler is not configured.");
    return;
  }

  callback();
}
