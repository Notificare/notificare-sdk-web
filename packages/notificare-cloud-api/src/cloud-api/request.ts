import { request, RequestAuthorization, RequestParams } from '../network/core/request';

export interface CloudRequestParams {
  environment: CloudRequestEnvironment;
}

export interface CloudRequestEnvironment {
  useTestEnvironment: boolean;
  applicationKey: string;
  applicationSecret: string;
}

export interface CloudInternalRequestParams extends CloudRequestParams, InternalRequestParams {
  path: string;
  searchParams?: URLSearchParams;
}

type InternalRequestParams = Pick<
  RequestParams,
  'method' | 'body' | 'formData' | 'retries' | 'retryDelay'
>;

export async function cloudRequest(params: CloudInternalRequestParams): Promise<Response> {
  const { environment, path, searchParams, ...rest } = params;

  const url = getCloudUrl(environment);
  url.pathname = path;

  searchParams?.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  return request({
    ...rest,
    url,
    authorization: getCloudRequestAuthorization(environment),
  });
}

function getCloudUrl({ useTestEnvironment }: CloudRequestEnvironment): URL {
  return useTestEnvironment
    ? new URL('https://cloud-test.notifica.re')
    : new URL('https://cloud.notifica.re');
}

function getCloudRequestAuthorization({
  applicationKey,
  applicationSecret,
}: CloudRequestEnvironment): RequestAuthorization {
  return {
    basic: {
      username: applicationKey,
      password: applicationSecret,
    },
  };
}
