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
