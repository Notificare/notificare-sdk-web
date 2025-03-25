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
 * @param {OnReadyCallback} callback - A {@link OnReadyCallback} that will be invoked with the result
 * of the onReady event.
 * - The callback receives a single parameter:
 *     - `application`: The {@link NotificareApplication} instance containing the application
 *     metadata.
 * @returns {EventSubscription} - The {@link EventSubscription} for the onReady event.
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
 * @param {OnUnlaunchedCallback} callback - A {@link OnUnlaunchedCallback} that will be invoked with
 * the result of the onUnlaunched event.
 * @returns {EventSubscription} - The {@link EventSubscription} for the onUnlaunched event.
 * */
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
 * This method is triggered after the device is initially created, which happens the first time
 * `launch()` is called.
 * Once created, the method will not trigger again unless the device is deleted by calling
 * `unlaunch()` and created again on a new `launch()`.
 *
 * @param {OnDeviceRegisteredCallback} callback - A {@link OnDeviceRegisteredCallback} that will be
 * invoked with the result of the onDeviceRegistered event.
 * - The callback receives a single parameter:
 *     - `device`: The {@link NotificareDevice} instance containing the device's registration
 *     details.
 * @returns {EventSubscription} - The {@link EventSubscription} for the onDeviceRegistered event.
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
