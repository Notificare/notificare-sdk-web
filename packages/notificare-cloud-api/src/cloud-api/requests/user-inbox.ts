import { cloudRequest, CloudRequestParams } from '../request';
import { CloudUserInboxNotificationResponse } from '../responses/user-inbox';

export async function fetchCloudUserInboxNotification(
  params: FetchCloudUserInboxNotificationParams,
): Promise<CloudUserInboxNotificationResponse> {
  const { id, deviceId, ...rest } = params;

  const encodedId = encodeURIComponent(id);
  const encodedDeviceId = encodeURIComponent(deviceId);

  const response = await cloudRequest({
    ...rest,
    path: `/api/notification/userinbox/${encodedId}/fordevice/${encodedDeviceId}`,
  });

  return response.json();
}

export interface FetchCloudUserInboxNotificationParams extends CloudRequestParams {
  deviceId: string;
  id: string;
}

export async function removeCloudUserInboxItem(
  params: RemoveCloudUserInboxItemParams,
): Promise<void> {
  const { id, deviceId, ...rest } = params;

  const encodedId = encodeURIComponent(id);
  const encodedDeviceId = encodeURIComponent(deviceId);

  await cloudRequest({
    ...rest,
    method: 'DELETE',
    path: `/api/notification/userinbox/${encodedId}/fordevice/${encodedDeviceId}`,
  });
}

export interface RemoveCloudUserInboxItemParams extends CloudRequestParams {
  deviceId: string;
  id: string;
}
