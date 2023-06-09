import { NotificareLocation } from '../../models/notificare-location';
import { logger } from '../../logger';

export function getLocationServicesEnabled(): boolean {
  const enabledStr = localStorage.getItem('re.notifica.geo.location_services_enabled');
  if (!enabledStr) return false;

  return enabledStr === 'true';
}

export function setLocationServicesEnabled(enabled: boolean | undefined) {
  if (!enabled) {
    localStorage.removeItem('re.notifica.geo.location_services_enabled');
    return;
  }

  localStorage.setItem('re.notifica.geo.location_services_enabled', enabled.toString());
}

export function getCurrentLocation(): NotificareLocation | undefined {
  const locationStr = localStorage.getItem('re.notifica.geo.location');
  if (!locationStr) return undefined;

  try {
    return JSON.parse(locationStr);
  } catch (e) {
    logger.warning('Failed to decode the stored device.', e);

    // Remove the corrupted location from local storage.
    setCurrentLocation(undefined);

    return undefined;
  }
}

export function setCurrentLocation(location: NotificareLocation | undefined) {
  if (!location) {
    localStorage.removeItem('re.notifica.geo.location');
    return;
  }

  const locationStr = JSON.stringify(location);
  localStorage.setItem('re.notifica.geo.location', locationStr);
}
