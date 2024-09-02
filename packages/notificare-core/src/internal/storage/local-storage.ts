import { NotificareApplication } from '../../models/notificare-application';
import { NotificareDevice } from '../../models/notificare-device';
import { logger } from '../logger';
import { StoredDevice } from './entities/stored-device';

export function getStoredApplication(): NotificareApplication | undefined {
  const applicationStr = localStorage.getItem('re.notifica.application');
  if (!applicationStr) return undefined;

  try {
    return JSON.parse(applicationStr);
  } catch (e) {
    logger.warning('Failed to decode the stored application.', e);

    // Remove the corrupted application from local storage.
    setStoredApplication(undefined);

    return undefined;
  }
}

export function setStoredApplication(application: NotificareApplication | undefined) {
  if (!application) {
    localStorage.removeItem('re.notifica.application');
    return;
  }

  localStorage.setItem('re.notifica.application', JSON.stringify(application));
}

export function getStoredDevice(): StoredDevice | undefined {
  const deviceStr = localStorage.getItem('re.notifica.device');
  if (!deviceStr) return undefined;

  try {
    return JSON.parse(deviceStr);
  } catch (e) {
    logger.warning('Failed to decode the stored device.', e);

    // Remove the corrupted device from local storage.
    setStoredDevice(undefined);

    return undefined;
  }
}

export function setStoredDevice(device: StoredDevice | undefined) {
  if (!device) {
    localStorage.removeItem('re.notifica.device');
    return;
  }

  localStorage.setItem('re.notifica.device', JSON.stringify(device));
}

export function isLongLivedDevice(device: StoredDevice): boolean {
  return device.transport === undefined || device.transport === null;
}

export function asPublicDevice(device: StoredDevice): NotificareDevice {
  return {
    id: device.id,
    userId: device.userId,
    userName: device.userName,
    timeZoneOffset: device.timeZoneOffset,
    dnd: device.dnd,
    userData: device.userData,
  };
}

export function clearStorage() {
  setStoredApplication(undefined);
  setStoredDevice(undefined);

  localStorage.removeItem('re.notifica.preferred_language');
  localStorage.removeItem('re.notifica.preferred_region');
  localStorage.removeItem('re.notifica.migrated');
  localStorage.removeItem('re.notifica.session');
  localStorage.removeItem('re.notifica.unload_timestamp');
}
