import { NotificareApplication } from '../models/notificare-application';
import { EventSubscription } from '../event-subscription';
import { logger } from './logger';
import { NotificareDevice } from '../models/notificare-device';

let onReadyCallback: OnReadyCallback | undefined;
let unlaunchedCallback: OnUnlaunchedCallback | undefined;
let deviceRegisteredCallback: OnDeviceRegisteredCallback | undefined;

export type OnReadyCallback = (application: NotificareApplication) => void;
export type OnUnlaunchedCallback = () => void;
export type OnDeviceRegisteredCallback = (device: NotificareDevice) => void;

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

export function onDeviceRegistered(callback: OnDeviceRegisteredCallback): EventSubscription {
  deviceRegisteredCallback = callback;

  return {
    remove: () => {
      deviceRegisteredCallback = undefined;
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

export function notifyDeviceRegistered(device: NotificareDevice) {
  const callback = deviceRegisteredCallback;
  if (!callback) {
    logger.debug("The 'device_registered' handler is not configured.");
    return;
  }

  callback(device);
}
