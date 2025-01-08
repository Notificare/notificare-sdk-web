import {
  getApplication,
  isReady,
  NotificareApplicationUnavailableError,
  NotificareNotReadyError,
  NotificareServiceUnavailableError,
} from '@notificare/web-core';
import { startLocationUpdates, stopLocationUpdates } from './internal/internal-api';
import {
  getLocationServicesEnabled,
  setLocationServicesEnabled,
} from './internal/storage/local-storage';
import { logger } from './logger';

export {
  onLocationUpdated,
  onLocationUpdateError,
  OnLocationUpdatedCallback,
  OnLocationUpdateErrorCallback,
} from './internal/consumer-events';

/**
 * Indicates whether location services are enabled.
 *
 * @returns {boolean} - `true` if the location services are enabled, and `false` otherwise.
 */
export function hasLocationServicesEnabled(): boolean {
  return getLocationServicesEnabled();
}

/**
 * Enables location updates, activating location tracking.
 */
export function enableLocationUpdates() {
  try {
    checkPrerequisites();
  } catch (e) {
    return;
  }

  setLocationServicesEnabled(true);
  startLocationUpdates();
}

/**
 * Disables location updates.
 */
export function disableLocationUpdates() {
  try {
    checkPrerequisites();
  } catch (e) {
    return;
  }

  setLocationServicesEnabled(false);
  stopLocationUpdates();
}

function checkPrerequisites() {
  if (!isReady()) {
    logger.warning('Notificare is not ready yet.');
    throw new NotificareNotReadyError();
  }

  const application = getApplication();
  if (!application) {
    logger.warning('Notificare application is not yet available.');
    throw new NotificareApplicationUnavailableError();
  }

  if (!application.services.locationServices) {
    logger.warning('Notificare location functionality is not enabled.');
    throw new NotificareServiceUnavailableError('locationServices');
  }

  if (!('geolocation' in navigator)) {
    logger.warning('The browser does not support geolocation.');
    throw new Error('The browser does not support geolocation.');
  }
}
