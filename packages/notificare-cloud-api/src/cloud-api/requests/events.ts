import { CloudCreateEventPayload } from '../payloads/event';
import { cloudRequest, CloudRequestParams } from '../request';

export async function createEvent(params: CreateEventParams): Promise<void> {
  const { payload, ...rest } = params;

  await cloudRequest({
    ...rest,
    method: 'POST',
    path: `/api/event`,
    body: payload,
  });
}

export interface CreateEventParams extends CloudRequestParams {
  payload: CloudCreateEventPayload;
}
