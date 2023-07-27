import { getCurrentDevice, NotificareDeviceUnavailableError, request } from '@notificare/core';
import { setCurrentLocation } from './storage/local-storage';

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
