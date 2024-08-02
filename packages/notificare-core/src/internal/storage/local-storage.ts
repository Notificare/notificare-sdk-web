import { NotificareDevice } from '../../models/notificare-device';
import { logger } from '../logger';
import { StoredDevice } from './entities/stored-device';

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
