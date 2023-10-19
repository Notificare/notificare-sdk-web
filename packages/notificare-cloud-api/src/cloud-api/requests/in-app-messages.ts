import { CloudInAppMessageResponse } from '../responses/in-app-message';
import { cloudRequest, CloudRequestParams } from '../request';

export async function fetchInAppMessage(
  params: FetchInAppMessageParams,
): Promise<CloudInAppMessageResponse> {
  const { context, deviceId, ...rest } = params;

  const response = await cloudRequest({
    ...rest,
    path: `/api/notification/${encodeURIComponent(context)}`,
    searchParams: new URLSearchParams({ deviceID: deviceId }),
  });

  return response.json();
}

export interface FetchInAppMessageParams extends CloudRequestParams {
  context: 'launch' | 'foreground';
  deviceId: string;
}
