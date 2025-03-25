import { fetchCloudAssetGroup } from '@notificare/web-cloud-api';
import {
  getApplication,
  getCloudApiEnvironment,
  getCurrentDevice,
  isReady,
  NotificareApplicationUnavailableError,
  NotificareDeviceUnavailableError,
  NotificareNotReadyError,
  NotificareServiceUnavailableError,
} from '@notificare/web-core';
import { convertCloudAssetToPublic } from './internal/cloud-api/assets-converter';
import { logger } from './logger';
import { NotificareAsset } from './models/notificare-asset';

/**
 * Fetches a list of {@link NotificareAsset} for a specified group.
 *
 * @param {string} group - The name of the group whose assets are to be fetched.
 * @return {Promise<NotificareAsset[]>} - A promise that resolves to a list of {@link NotificareAsset}
 * belonging to the specified group.
 */
export async function fetchAssets(group: string): Promise<NotificareAsset[]> {
  checkPrerequisites();

  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  const { assets } = await fetchCloudAssetGroup({
    environment: getCloudApiEnvironment(),
    deviceId: device.id,
    userId: device.userId,
    group,
  });

  return assets.map((asset) => convertCloudAssetToPublic(asset));
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

  if (!application.services.storage) {
    logger.warning('Notificare storage functionality is not enabled.');
    throw new NotificareServiceUnavailableError('storage');
  }
}
