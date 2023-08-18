import { logger } from './logger';
import { components } from './component-cache';
import { NotificareDevice } from '../models/notificare-device';
import { storeCurrentDevice } from './storage/local-storage';

export function isLatestStorageStructure(): boolean {
  return localStorage.getItem('re.notifica.migrated') === 'true';
}

export function migrate() {
  logger.debug('Checking if there is legacy data that needs to be migrated.');

  if (hasLegacyStorage()) {
    const deviceStr = localStorage.getItem('notificareDevice');
    if (deviceStr) {
      logger.debug('Found legacy device stored.');

      try {
        const oldDevice = JSON.parse(deviceStr);

        const device: NotificareDevice = {
          id: oldDevice.deviceID,
          userId: oldDevice.userID,
          userName: oldDevice.userName,
          timeZoneOffset: oldDevice.timeZoneOffset,
          sdkVersion: oldDevice.sdkVersion,
          appVersion: oldDevice.appVersion,
          language: oldDevice.language,
          region: oldDevice.region,
          transport: oldDevice.transport,
          keys: oldDevice.keys,
          userData: {},
          lastRegistered: new Date(0).toUTCString(),
        };

        storeCurrentDevice(device);
      } catch (e) {
        logger.error('Failed to decode the legacy device.', e);
      }
    }

    const language = localStorage.getItem('notificarePreferredLanguage');
    if (language) {
      logger.debug('Found legacy language override stored.');
      localStorage.setItem('re.notifica.preferred_language', language);
    }

    const region = localStorage.getItem('notificarePreferredRegion');
    if (region) {
      logger.debug('Found legacy region override stored.');
      localStorage.setItem('re.notifica.preferred_region', region);
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const component of components.values()) {
      logger.debug(`Migrating '${component.name}' component.`);
      component.migrate();
    }

    localStorage.removeItem('notificareApplication');
    localStorage.removeItem('notificareDevice');
    localStorage.removeItem('notificareRegistration');
    localStorage.removeItem('notificareSession');
    localStorage.removeItem('notificareUnloadTimestamp');
    localStorage.removeItem('notificarePreferredLanguage');
    localStorage.removeItem('notificarePreferredRegion');

    logger.info('Legacy data found and migrated to the new storage format.');
  }

  localStorage.setItem('re.notifica.migrated', 'true');
}

function hasLegacyStorage(): boolean {
  return localStorage.getItem('notificareDevice') != null;
}
