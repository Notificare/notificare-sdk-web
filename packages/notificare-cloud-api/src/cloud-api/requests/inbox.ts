import { CloudInboxResponse } from '../responses/inbox';
import { cloudRequest, CloudRequestParams } from '../request';

export async function fetchInbox(params: FetchInboxParams): Promise<CloudInboxResponse> {
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

export interface FetchInboxParams extends CloudRequestParams {
  deviceId: string;
  skip?: number;
  limit?: number;
  since?: string;
}
