import { cloudRequest, CloudRequestParams } from '../request';
import { CloudUserInboxNotificationResponse } from '../responses/user-inbox';

export async function fetchUserInboxNotification(
  params: FetchUserInboxNotificationParams,
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

export interface FetchUserInboxNotificationParams extends CloudRequestParams {
  deviceId: string;
  id: string;
}

export async function removeUserInboxItem(params: RemoveUserInboxItemParams): Promise<void> {
  const { id, deviceId, ...rest } = params;

  const encodedId = encodeURIComponent(id);
  const encodedDeviceId = encodeURIComponent(deviceId);

  await cloudRequest({
    ...rest,
    method: 'DELETE',
    path: `/api/notification/userinbox/${encodedId}/fordevice/${encodedDeviceId}`,
  });
}

export interface RemoveUserInboxItemParams extends CloudRequestParams {
  deviceId: string;
  id: string;
}
