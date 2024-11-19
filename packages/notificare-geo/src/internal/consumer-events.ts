import { EventSubscription } from '@notificare/web-core';
import { logger } from '../logger';
import { NotificareLocation } from '../models/notificare-location';

let locationUpdatedCallback: OnLocationUpdatedCallback | undefined;
let locationUpdateErrorCallback: OnLocationUpdateErrorCallback | undefined;

export type OnLocationUpdatedCallback = (location: NotificareLocation) => void;
export type OnLocationUpdateErrorCallback = (error: GeolocationPositionError) => void;

/**
 * Called when the device's location is updated.
 *
 * This method is invoked when a new location update is received.
 *
 * @param callback A {@link OnLocationUpdatedCallback} that will be invoked with the result of the
 * onLocationUpdated event.
 *  - The callback receives a single parameter:
 *     - `location`: The {@link NotificareLocation} instance representing the current location.
 */
export function onLocationUpdated(callback: OnLocationUpdatedCallback): EventSubscription {
  locationUpdatedCallback = callback;

  return {
    remove: () => {
      locationUpdatedCallback = undefined;
    },
  };
}

/**
 * Called when the device's location failed to be updated.
 *
 * This method is invoked when an error occurs during a new location update.
 *
 * @param callback A {@link OnLocationUpdateErrorCallback} that will be invoked with the result of
 * the onLocationUpdateError event.
 *  - The callback receives a single parameter:
 *     - `error`: The {@link GeolocationPositionError} instance representing the location error.
 */
export function onLocationUpdateError(callback: OnLocationUpdateErrorCallback): EventSubscription {
  locationUpdateErrorCallback = callback;

  return {
    remove: () => {
      locationUpdateErrorCallback = undefined;
    },
  };
}

export function notifyLocationUpdated(location: NotificareLocation) {
  const callback = locationUpdatedCallback;
  if (!callback) {
    logger.warning("The 'location_updated' handler is not configured.");
    return;
  }

  callback(location);
}

export function notifyLocationUpdateError(error: GeolocationPositionError) {
  const callback = locationUpdateErrorCallback;
  if (!callback) {
    logger.warning("The 'location_update_error' handler is not configured.");
    return;
  }

  callback(error);
}
