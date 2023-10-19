import { CloudAssetsResponse } from '../responses/assets';
import { cloudRequest, CloudRequestParams } from '../request';

export async function fetchAssetGroup(params: FetchAssetGroupParams): Promise<CloudAssetsResponse> {
  const { deviceId, userId, group, ...rest } = params;

  const searchParams = new URLSearchParams({ deviceID: deviceId });
  if (userId) searchParams.set('userID', userId);

  const response = await cloudRequest({
    ...rest,
    path: `/api/asset/forgroup/${encodeURIComponent(group)}`,
    searchParams,
  });

  return response.json();
}

export interface FetchAssetGroupParams extends CloudRequestParams {
  deviceId: string;
  userId?: string; // TODO: remove when the API stop processing this property.
  group: string;
}
