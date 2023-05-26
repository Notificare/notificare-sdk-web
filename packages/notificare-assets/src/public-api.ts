import {
  getApplication,
  getCurrentDevice,
  isReady,
  NotificareApplicationUnavailableError,
  NotificareDeviceUnavailableError,
  NotificareNotReadyError,
  NotificareServiceUnavailableError,
  request,
} from '@notificare/core';
import { logger } from './logger';
import { NotificareAsset } from './models/notificare-asset';
import {
  convertNetworkAssetToPublic,
  NetworkAssetsResponse,
} from './internal/network/responses/assets-response';

export async function fetchAssets(group: string): Promise<NotificareAsset[]> {
  checkPrerequisites();

  const device = getCurrentDevice();
  if (!device) throw new NotificareDeviceUnavailableError();

  const queryParameters = new URLSearchParams({ deviceID: device.id });
  if (device.userId) queryParameters.set('userID', device.userId);

  const response = await request(
    `/api/asset/forgroup/${encodeURIComponent(group)}?${queryParameters}`,
  );

  const { assets }: NetworkAssetsResponse = await response.json();
  return assets.map((asset) => convertNetworkAssetToPublic(asset));
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
