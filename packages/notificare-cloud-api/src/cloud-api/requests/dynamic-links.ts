import { cloudRequest, CloudRequestParams } from '../request';
import { CloudDynamicLinkResponse } from '../responses/dynamic-link';

export async function fetchCloudDynamicLink(
  params: FetchCloudDynamicLinkParams,
): Promise<CloudDynamicLinkResponse> {
  const { deviceId, url, ...rest } = params;

  const searchParams = new URLSearchParams({ platform: 'Web' });
  if (deviceId) searchParams.set('deviceID', deviceId);

  const response = await cloudRequest({
    ...rest,
    path: `/api/link/dynamic/${encodeURIComponent(url)}`,
    searchParams,
  });

  return response.json();
}

export interface FetchCloudDynamicLinkParams extends CloudRequestParams {
  deviceId?: string;
  url: string;
}
