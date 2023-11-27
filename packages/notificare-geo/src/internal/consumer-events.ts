import { EventSubscription } from '@notificare/web-core';
import { logger } from '../logger';
import { NotificareLocation } from '../models/notificare-location';

let locationUpdatedCallback: OnLocationUpdatedCallback | undefined;
let locationUpdateErrorCallback: OnLocationUpdateErrorCallback | undefined;

export type OnLocationUpdatedCallback = (location: NotificareLocation) => void;
export type OnLocationUpdateErrorCallback = (error: GeolocationPositionError) => void;

export function onLocationUpdated(callback: OnLocationUpdatedCallback): EventSubscription {
  locationUpdatedCallback = callback;

  return {
    remove: () => {
      locationUpdatedCallback = undefined;
    },
  };
}

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
