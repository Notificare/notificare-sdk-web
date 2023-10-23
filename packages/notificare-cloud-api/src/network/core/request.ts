import { NotificareNetworkRequestError } from './errors';
import { base64Encode, sleep } from '../../utils';
import { logger } from '../../logger';

export async function request(params: RequestParams): Promise<Response> {
  const { url, method = 'GET' } = params;

  logger.debug(`${method} ${url}`);

  const retries = params.retries ?? defaults.retries;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    let response: Response | undefined;

    try {
      // eslint-disable-next-line no-await-in-loop
      response = await fetch(url, {
        method,
        body: getRequestBody(params),
        headers: getRequestHeaders(params),
      });

      // The request completed successfully and the response is OK.
      // Otherwise, don't retry and throw immediately.
      if (response.ok) return response;
    } catch (e) {
      logger.warning(`Request attempt #${attempt + 1} failed.`, e);

      if (attempt < retries) {
        const delay = calculateRetryDelayInMilliseconds(attempt, params);
        logger.debug(`Retrying in ${delay} milliseconds...`);

        // eslint-disable-next-line no-await-in-loop
        await sleep(delay);
      }
    }

    // Having a response after the try catch means the request completed successfully
    // but there's something wrong with it (ie bad request).
    if (response) throw new NotificareNetworkRequestError(response);
  }

  logger.error('Request exceeded maximum retries.');
  throw new Error('Request exceeded maximum retries.');
}

export interface RequestParams {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  url: URL | string;
  authorization?: RequestAuthorization;
  body?: unknown;
  formData?: FormData;
  retries?: number;
  retryDelay?: number | RetryDelayFn;
}

export interface RequestAuthorization {
  basic?: RequestBasicAuthorization;
  bearer?: string;
}

export interface RequestBasicAuthorization {
  username: string;
  password: string;
}

function getRequestHeaders(params: RequestParams): Headers {
  const headers = new Headers();
  headers.set('Accept', 'application/json');

  if (params.body) headers.set('Content-Type', 'application/json');
  if (params.formData) headers.set('Content-Type', 'application/form-data');

  const authorizationHeader = getAuthorizationHeader(params);
  if (authorizationHeader) headers.set('Authorization', authorizationHeader);

  return headers;
}

function getAuthorizationHeader({ authorization }: RequestParams): string | undefined {
  if (!authorization) return undefined;

  const { basic } = authorization;
  if (basic) {
    const encoded = base64Encode(`${basic.username}:${basic.password}`);
    return `Basic ${encoded}`;
  }

  const { bearer } = authorization;
  if (bearer) {
    return `Bearer ${bearer}`;
  }

  return undefined;
}

function getRequestBody(params: RequestParams): BodyInit | undefined {
  if (params.body) return JSON.stringify(params.body);
  if (params.formData) return params.formData;

  return undefined;
}

function calculateRetryDelayInMilliseconds(attempt: number, params: RequestParams): number {
  const retryDelay = params.retryDelay ?? defaults.retryDelay;

  if (typeof retryDelay === 'function') {
    return retryDelay(attempt);
  }

  return retryDelay;
}

export type RetryDelayFn = (attempt: number) => number;

type DefaultRetryOptions = Required<Pick<RequestParams, 'retries' | 'retryDelay'>>;

const defaults: DefaultRetryOptions = {
  retries: 3,
  retryDelay: (attempt) => 2 ** attempt * 1000, // 1000, 2000, 4000
};
