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

export function hasLocationServicesEnabled(): boolean {
  return getLocationServicesEnabled();
}

export function enableLocationUpdates() {
  try {
    checkPrerequisites();
  } catch (e) {
    return;
  }

  setLocationServicesEnabled(true);
  startLocationUpdates();
}

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
