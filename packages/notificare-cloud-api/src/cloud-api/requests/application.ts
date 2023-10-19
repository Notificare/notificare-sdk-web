import { CloudApplicationResponse } from '../responses/application';
import { cloudRequest, CloudRequestParams } from '../request';

export async function fetchApplication(
  params: FetchApplicationParams,
): Promise<CloudApplicationResponse> {
  const { language, ...rest } = params;
  const searchParams = new URLSearchParams();

  if (language) searchParams.set('language', language);

  const response = await cloudRequest({
    ...rest,
    path: '/api/application/info',
    searchParams,
  });

  return response.json();
}

export interface FetchApplicationParams extends CloudRequestParams {
  language?: string;
}
