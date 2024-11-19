import { EventSubscription } from '../event-subscription';
import { NotificareApplication } from '../models/notificare-application';
import { NotificareDevice } from '../models/notificare-device';
import { logger } from './logger';

let onReadyCallback: OnReadyCallback | undefined;
let unlaunchedCallback: OnUnlaunchedCallback | undefined;
let deviceRegisteredCallback: OnDeviceRegisteredCallback | undefined;

export type OnReadyCallback = (application: NotificareApplication) => void;
export type OnUnlaunchedCallback = () => void;
export type OnDeviceRegisteredCallback = (device: NotificareDevice) => void;

/**
 * Called when the Notificare SDK is fully ready and the application metadata is available.
 *
 * This method is invoked after the SDK has been successfully launched and is available for use.
 *
 * @param callback A {@link onReadyCallback} that will be invoked with the result of the onReady
 * event.
 * - The callback receives a single parameter:
 *     - `application`: The {@link NotificareApplication} instance containing the application
 *     metadata.
 */
export function onReady(callback: OnReadyCallback): EventSubscription {
  onReadyCallback = callback;

  return {
    remove: () => {
      onReadyCallback = undefined;
    },
  };
}

/**
 * Called when the Notificare SDK has been unlaunched.
 *
 * This method is invoked after the SDK has been shut down (unlaunched) and is no longer in use.
 *
 * @param callback A {@link OnUnlaunchedCallback} that will be invoked with the result of the
 * onUnlaunched event.
 */
export function onUnlaunched(callback: OnUnlaunchedCallback): EventSubscription {
  unlaunchedCallback = callback;

  return {
    remove: () => {
      unlaunchedCallback = undefined;
    },
  };
}

/**
 * Called when the device has been successfully registered with the Notificare platform.
 *
 * This method is invoked after the device has been registered, making it eligible to receive
 * notifications and participate in device-specific interactions.
 *
 * @param callback A {@link OnDeviceRegisteredCallback} that will be invoked with the result of the
 * onDeviceRegistered event.
 * - The callback receives a single parameter:
 *     - `device`: The {@link NotificareDevice} instance containing the device's registration
 *     details.
 */
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
