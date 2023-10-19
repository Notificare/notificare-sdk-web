import { CloudDynamicLinkResponse } from '../responses/dynamic-link';
import { cloudRequest, CloudRequestParams } from '../request';

export async function fetchDynamicLink(
  params: FetchDynamicLinkParams,
): Promise<CloudDynamicLinkResponse> {
  const { deviceId, url, ...rest } = params;

  const response = await cloudRequest({
    ...rest,
    path: `/api/link/dynamic/${encodeURIComponent(url)}`,
    searchParams: new URLSearchParams({
      platform: 'Web',
      deviceID: deviceId,
    }),
  });

  return response.json();
}

export interface FetchDynamicLinkParams extends CloudRequestParams {
  deviceId: string;
  url: string;
}
