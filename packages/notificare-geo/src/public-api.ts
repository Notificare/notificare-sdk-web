import {
  getApplication,
  getCurrentDevice,
  getOptions,
  isReady,
  NotificareApplicationUnavailableError,
  NotificareDeviceUnavailableError,
  NotificareNotReadyError,
  NotificareServiceUnavailableError,
  request,
} from '@notificare/core';
import { logger } from './logger';
import {
  getCurrentLocation,
  getLocationServicesEnabled,
  setCurrentLocation,
  setLocationServicesEnabled,
} from './internal/storage/local-storage';
import { NotificareLocation } from './models/notificare-location';
import { notifyLocationUpdated, notifyLocationUpdateError } from './internal/consumer-events';

let geolocationWatchId: number | undefined;

export { onLocationUpdated } from './internal/consumer-events';

export function hasLocationServicesEnabled(): boolean {
  return getLocationServicesEnabled();
}

export function enableLocationUpdates() {
  try {
    checkPrerequisites();
  } catch (e) {
    return;
  }

  const options = getOptions();
  if (!options) return;

  if (geolocationWatchId) {
    logger.info('Location updates were enabled. Skipping...');
    return;
  }

  setLocationServicesEnabled(true);

  geolocationWatchId = navigator.geolocation.watchPosition(
    function onSuccess(position) {
      logger.debug('Received a location update.');
      processLocationUpdate(position)
        .then(() => logger.debug('Location update processed.'))
        .catch((e) => logger.error('Failed to process location update.', e));
    },
    function onError(error) {
      logger.error('Failed to monitor location updates.', error);
      notifyLocationUpdateError(error);
    },
    {
      timeout: options?.geolocation?.timeout,
      enableHighAccuracy: options?.geolocation?.enableHighAccuracy,
      maximumAge: options?.geolocation?.maximumAge,
    },
  );

  logger.info('Location updates enabled.');
}

export function disableLocationUpdates() {
  try {
    checkPrerequisites();
  } catch (e) {
    return;
  }

  setLocationServicesEnabled(false);
  setCurrentLocation(undefined);

  if (geolocationWatchId) {
    logger.debug('Removing location monitor.');
    navigator.geolocation.clearWatch(geolocationWatchId);
    geolocationWatchId = undefined;
  }

  updateLocation(undefined, undefined)
    .then(() => logger.debug('Cleared device location.'))
    .catch((e) => logger.error('Failed to clear device location.', e))
    .finally(() => logger.info('Location updates disabled.'));
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

async function processLocationUpdate(position: GeolocationPosition): Promise<void> {
  const location = createLocation(position);

  if (!shouldUpdateLocation(position)) {
    logger.debug('Skipping duplicate location update.');
    notifyLocationUpdated(location);
    return;
  }

  let country: string | undefined;
  try {
    country = await determineCountry(position);
  } catch (e) {
    logger.warning("Unable to determine the location's country.", e);
  }

  await updateLocation(position, country);

  setCurrentLocation(location);
  notifyLocationUpdated(location);
}

function shouldUpdateLocation(position: GeolocationPosition): boolean {
  const currentLocation = getCurrentLocation();
  if (!currentLocation) return true;

  return (
    currentLocation.latitude !== position.coords.latitude ||
    currentLocation.longitude !== position.coords.longitude
  );
}

async function updateLocation(
  position: GeolocationPosition | undefined,
  country: string | undefined,
): Promise<void> {
  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  await request(`/api/device/${encodeURIComponent(device.id)}`, {
    method: 'PUT',
    body: {
      latitude: position?.coords?.latitude,
      longitude: position?.coords?.longitude,
      altitude: position?.coords?.altitude,
      course: position?.coords?.heading,
      speed: position?.coords?.speed,
      locationAccuracy: position?.coords?.accuracy,
      country,
      locationServicesAuthStatus: position ? 'use' : undefined,
      locationServicesAccuracyAuth: position ? 'full' : undefined,
    },
  });
}

async function determineCountry(position: GeolocationPosition): Promise<string> {
  if (!google || !google.maps) throw new Error('Google Maps API unavailable.');

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { Geocoder } = await google.maps.importLibrary('geocoding');

  const geocoder: google.maps.Geocoder = new Geocoder();
  const response = await geocoder.geocode({
    location: new google.maps.LatLng({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    }),
  });

  if (!response.results.length) throw new Error('Geocoding contained no results.');

  const result = response.results[0];
  const component = result.address_components.find(({ types }) => types.includes('country'));
  if (!component) throw new Error('Geocoding unable to determine the country.');

  return component.short_name;
}

function createLocation(position: GeolocationPosition): NotificareLocation {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    altitude: position.coords.altitude ?? undefined,
    course: position.coords.heading ?? undefined,
    speed: position.coords.speed ?? undefined,
    horizontalAccuracy: position.coords.accuracy ?? undefined,
    verticalAccuracy: position.coords.altitudeAccuracy ?? undefined,
    timestamp: position.timestamp,
  };
}
