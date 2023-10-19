import { CloudNotificationResponse } from '../responses/notification';
import { cloudRequest, CloudRequestParams } from '../request';

export async function fetchNotification(
  params: FetchNotificationParams,
): Promise<CloudNotificationResponse> {
  const { id, ...rest } = params;

  const response = await cloudRequest({
    ...rest,
    path: `/api/notification/${encodeURIComponent(id)}`,
  });

  return response.json();
}

export interface FetchNotificationParams extends CloudRequestParams {
  id: string;
}
