import { CloudInAppMessageResponse } from '../responses/in-app-message';
import { cloudRequest, CloudRequestParams } from '../request';

export async function fetchCloudInAppMessage(
  params: FetchCloudInAppMessageParams,
): Promise<CloudInAppMessageResponse> {
  const { context, deviceId, ...rest } = params;

  const response = await cloudRequest({
    ...rest,
    path: `/api/inappmessage/forcontext/${encodeURIComponent(context)}`,
    searchParams: new URLSearchParams({ deviceID: deviceId }),
  });

  return response.json();
}

export interface FetchCloudInAppMessageParams extends CloudRequestParams {
  context: 'launch' | 'foreground';
  deviceId: string;
}
