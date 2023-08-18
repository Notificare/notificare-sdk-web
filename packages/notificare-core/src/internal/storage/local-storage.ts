import { NotificareDevice } from '../../models/notificare-device';
import { logger } from '../logger';

export function getCurrentDevice(): NotificareDevice | undefined {
  const deviceStr = localStorage.getItem('re.notifica.device');
  if (!deviceStr) return undefined;

  try {
    return JSON.parse(deviceStr);
  } catch (e) {
    logger.warning('Failed to decode the stored device.', e);

    // Remove the corrupted device from local storage.
    storeCurrentDevice(undefined);

    return undefined;
  }
}

export function storeCurrentDevice(device: NotificareDevice | undefined) {
  if (!device) {
    localStorage.removeItem('re.notifica.device');
    return;
  }

  localStorage.setItem('re.notifica.device', JSON.stringify(device));
}
