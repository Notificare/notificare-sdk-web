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
