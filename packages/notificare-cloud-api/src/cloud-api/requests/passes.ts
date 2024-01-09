import { cloudRequest, CloudRequestParams } from '../request';
import { CloudPassResponse } from '../responses/pass';
import { CloudPassSaveLinksResponse } from '../responses/pass-save-links';

export async function fetchCloudPass(params: FetchCloudPassParams): Promise<CloudPassResponse> {
  const { serial, ...rest } = params;

  const response = await cloudRequest({
    ...rest,
    path: `/api/pass/forserial/${encodeURIComponent(serial)}`,
  });

  return response.json();
}

export interface FetchCloudPassParams extends CloudRequestParams {
  serial: string;
}

export async function fetchCloudPassSaveLinks(
  params: FetchCloudPassSaveLinksParams,
): Promise<CloudPassSaveLinksResponse> {
  const { serial, ...rest } = params;

  const response = await cloudRequest({
    ...rest,
    path: `/api/pass/savelinks/${encodeURIComponent(serial)}`,
  });

  return response.json();
}

export interface FetchCloudPassSaveLinksParams extends CloudRequestParams {
  serial: string;
}
