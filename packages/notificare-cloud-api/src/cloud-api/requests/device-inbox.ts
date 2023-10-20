import { CloudDeviceInboxResponse } from '../responses/device-inbox';
import { cloudRequest, CloudRequestParams } from '../request';

export async function fetchDeviceInbox(
  params: FetchDeviceInboxParams,
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

export interface FetchDeviceInboxParams extends CloudRequestParams {
  deviceId: string;
  skip?: number;
  limit?: number;
  since?: string;
}

export async function removeDeviceInboxItem(params: RemoveDeviceInboxItemParams): Promise<void> {
  const { id, ...rest } = params;

  await cloudRequest({
    ...rest,
    method: 'DELETE',
    path: `/api/notification/inbox/${encodeURIComponent(id)}`,
  });
}

export interface RemoveDeviceInboxItemParams extends CloudRequestParams {
  id: string;
}

export async function markDeviceInboxAsRead(params: MarkDeviceInboxAsReadParams): Promise<void> {
  const { deviceId, ...rest } = params;

  await cloudRequest({
    ...rest,
    method: 'PUT',
    path: `/api/notification/inbox/fordevice/${encodeURIComponent(deviceId)}`,
  });
}

export interface MarkDeviceInboxAsReadParams extends CloudRequestParams {
  deviceId: string;
}

export async function clearDeviceInbox(params: ClearDeviceInboxParams): Promise<void> {
  const { deviceId, ...rest } = params;

  await cloudRequest({
    ...rest,
    method: 'DELETE',
    path: `/api/notification/inbox/fordevice/${encodeURIComponent(deviceId)}`,
  });
}

export interface ClearDeviceInboxParams extends CloudRequestParams {
  deviceId: string;
}
