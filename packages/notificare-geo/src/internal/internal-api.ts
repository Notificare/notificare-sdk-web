import {
  getCurrentDevice,
  getOptions,
  NotificareDeviceUnavailableError,
  request,
} from '@notificare/core';
import { getCurrentLocation, setCurrentLocation } from './storage/local-storage';
import { logger } from '../logger';
import { notifyLocationUpdated, notifyLocationUpdateError } from './consumer-events';
import { NotificareLocation } from '../models/notificare-location';

let geolocationWatchId: number | undefined;

export function startLocationUpdates() {
  const options = getOptions();
  if (!options) {
    logger.warning('Cannot start location updates before Notificare is configured.');
    return;
  }

  if (geolocationWatchId) {
    logger.info('Location updates were enabled. Skipping...');
    return;
  }

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

export function stopLocationUpdates() {
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

export async function clearLocation(): Promise<void> {
  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  await request(`/api/device/${encodeURIComponent(device.id)}`, {
    method: 'PUT',
    body: {
      latitude: null,
      longitude: null,
      altitude: null,
      course: null,
      speed: null,
      locationAccuracy: null,
      country: null,
      locationServicesAuthStatus: null,
      locationServicesAccuracyAuth: null,
    },
  });

  setCurrentLocation(undefined);
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
      latitude: position?.coords?.latitude ?? null,
      longitude: position?.coords?.longitude ?? null,
      altitude: position?.coords?.altitude ?? null,
      course: position?.coords?.heading ?? null,
      speed: position?.coords?.speed ?? null,
      locationAccuracy: position?.coords?.accuracy ?? null,
      country: country ?? null,
      locationServicesAuthStatus: position ? 'use' : null,
      locationServicesAccuracyAuth: position ? 'full' : null,
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
