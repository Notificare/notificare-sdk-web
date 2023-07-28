import { getOptions } from '../options';
import { logger } from '../logger';
import { NotificareNetworkRequestError } from '../../errors/notificare-network-request-error';

const defaults: DefaultRetryOptions = {
  retries: 3,
  retryDelay: (attempt) => 2 ** attempt * 1000, // 1000, 2000, 4000
};

export async function request(url: string, options?: RequestOptions): Promise<Response> {
  const method = options?.method ?? 'GET';
  const completeUrl = options?.isAbsolutePath ? url : getCompleteUrl(url);
  logger.debug(`${method} ${completeUrl}`);

  const retries = options?.retries ?? defaults.retries;

  const headers = new Headers();
  headers.set('Accept', 'application/json');
  if (options?.body) headers.set('Content-Type', 'application/json');

  const authorizationHeader = getAuthorizationHeader();
  if (authorizationHeader) headers.set('Authorization', authorizationHeader);

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    let response: Response | undefined;

    let body: BodyInit | undefined;
    if (options?.body) body = JSON.stringify(options.body);
    if (options?.formData) body = options.formData;

    try {
      // eslint-disable-next-line no-await-in-loop
      response = await fetch(completeUrl, {
        method,
        body,
        headers,
      });

      // The request completed successfully and the response is OK.
      // Otherwise, don't retry and throw immediately.
      if (response.ok) return response;
    } catch (e) {
      logger.error(`Request attempt #${attempt + 1} failed.`, e);

      const retryDelay = options?.retryDelay ?? defaults.retryDelay;
      let retryDelayMilliseconds: number;

      if (typeof retryDelay === 'function') {
        retryDelayMilliseconds = retryDelay(attempt);
      } else {
        retryDelayMilliseconds = retryDelay;
      }

      if (attempt < retries) {
        logger.debug(`Retrying in ${retryDelayMilliseconds} milliseconds...`);

        // eslint-disable-next-line no-await-in-loop
        await sleep(retryDelayMilliseconds);
      }
    }

    // Having a response after the try catch means the request completed successfully
    // but there's something wrong with it (ie bad request).
    if (response) throw new NotificareNetworkRequestError(response);
  }

  throw new Error('Request exceeded maximum retries.');
}

export interface RequestOptions {
  isAbsolutePath?: boolean;
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  formData?: FormData;
  retries?: number;
  retryDelay?: number | RetryDelayFn;
}

type RetryDelayFn = (attempt: number) => number;

type DefaultRetryOptions = Required<Pick<RequestOptions, 'retries' | 'retryDelay'>>;

/**
 * Expands the provided URL to its full form.
 *
 * @param url - Either a fully-formed or partial URL.
 * @returns The expanded URL.
 */
function getCompleteUrl(url: string): string {
  if (url.startsWith('http')) return url;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const options = getOptions()!;
  const baseUrl = options.services.cloudHost;

  return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
}

function getAuthorizationHeader(): string | undefined {
  const options = getOptions();
  if (!options) return undefined;

  const username = options.applicationKey;
  const password = options.applicationSecret;
  const encoded = btoa(`${username}:${password}`);

  return `Basic ${encoded}`;
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
