import { NotificareNetworkRequestError } from '@notificare/web-core';
import { WorkerConfiguration } from '../configuration/worker-configuration';
import { base64Encode, sleep } from '../utils';
import { logger } from '../../logger';

export async function workerRequest(params: WorkerRequestParams) {
  const { method = 'GET' } = params;
  const url = getRequestUrl(params);

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
      logger.error(`Request attempt #${attempt + 1} failed.`, e);

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

  throw new Error('Request exceeded maximum retries.');
}

interface WorkerRequestParams {
  config: WorkerConfiguration;
  url: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  retries?: number;
  retryDelay?: number | RetryDelayFn;
}

function getRequestUrl({ config, url }: WorkerRequestParams): string {
  if (url.startsWith('http')) return url;

  const baseUrl = config.useTestEnvironment
    ? 'https://cloud-test.notifica.re'
    : 'https://cloud.notifica.re';

  return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
}

function getRequestHeaders(params: WorkerRequestParams): Headers {
  const headers = new Headers();
  headers.set('Accept', 'application/json');

  if (params.body) headers.set('Content-Type', 'application/json');

  const authorizationHeader = getAuthorizationHeader(params);
  headers.set('Authorization', authorizationHeader);

  return headers;
}

function getAuthorizationHeader({ config }: WorkerRequestParams): string {
  const encoded = base64Encode(`${config.applicationKey}:${config.applicationSecret}`);
  return `Basic ${encoded}`;
}

function getRequestBody(params: WorkerRequestParams): BodyInit | undefined {
  if (params.body) return JSON.stringify(params.body);

  return undefined;
}

function calculateRetryDelayInMilliseconds(attempt: number, params: WorkerRequestParams): number {
  const retryDelay = params.retryDelay ?? defaults.retryDelay;

  if (typeof retryDelay === 'function') {
    return retryDelay(attempt);
  }

  return retryDelay;
}

type RetryDelayFn = (attempt: number) => number;

type DefaultRetryOptions = Required<Pick<WorkerRequestParams, 'retries' | 'retryDelay'>>;

const defaults: DefaultRetryOptions = {
  retries: 3,
  retryDelay: (attempt) => 2 ** attempt * 1000, // 1000, 2000, 4000
};
