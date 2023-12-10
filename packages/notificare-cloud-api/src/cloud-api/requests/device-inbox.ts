import { cloudRequest, CloudRequestParams } from '../request';
import { CloudDeviceInboxResponse } from '../responses/device-inbox';

export async function fetchCloudDeviceInbox(
  params: FetchCloudDeviceInboxParams,
): Promise<CloudDeviceInboxResponse> {
  const { deviceId, skip, limit, since, ...rest } = params;

  const searchParams = new URLSearchParams({
    skip: skip?.toString() ?? '0',
    limit: limit?.toString() ?? '100',
  });

  if (since) searchParams.set('since', since);

  const response = await cloudRequest({
    ...rest,
    path: `/api/notification/inbox/fordevice/${encodeURIComponent(deviceId)}`,
    searchParams,
  });

  return response.json();
}

export interface FetchCloudDeviceInboxParams extends CloudRequestParams {
  deviceId: string;
  skip?: number;
  limit?: number;
  since?: string;
}

export async function removeCloudDeviceInboxItem(
  params: RemoveCloudDeviceInboxItemParams,
): Promise<void> {
  const { id, ...rest } = params;

  await cloudRequest({
    ...rest,
    method: 'DELETE',
    path: `/api/notification/inbox/${encodeURIComponent(id)}`,
  });
}

export interface RemoveCloudDeviceInboxItemParams extends CloudRequestParams {
  id: string;
}

export async function markCloudDeviceInboxAsRead(
  params: MarkCloudDeviceInboxAsReadParams,
): Promise<void> {
  const { deviceId, ...rest } = params;

  await cloudRequest({
    ...rest,
    method: 'PUT',
    path: `/api/notification/inbox/fordevice/${encodeURIComponent(deviceId)}`,
  });
}

export interface MarkCloudDeviceInboxAsReadParams extends CloudRequestParams {
  deviceId: string;
}

export async function clearCloudDeviceInbox(params: ClearCloudDeviceInboxParams): Promise<void> {
  const { deviceId, ...rest } = params;

  await cloudRequest({
    ...rest,
    method: 'DELETE',
    path: `/api/notification/inbox/fordevice/${encodeURIComponent(deviceId)}`,
  });
}

export interface ClearCloudDeviceInboxParams extends CloudRequestParams {
  deviceId: string;
}
