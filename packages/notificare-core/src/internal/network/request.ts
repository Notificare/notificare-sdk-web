import { getOptions } from '../options';
import { logger } from '../logger';

const defaults: DefaultRetryOptions = {
  retries: 3,
  retryDelay: (attempt) => 2 ** attempt * 1000, // 1000, 2000, 4000
};

export async function request(url: string, options?: RequestOptions): Promise<Response> {
  const completeUrl = options?.isAbsolutePath ? url : getCompleteUrl(url);
  logger.debug(`Fetching ${completeUrl}`);

  const retries = options?.retries ?? defaults.retries;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await fetch(completeUrl, {
        method: options?.method ?? 'GET',
        body: JSON.stringify(options?.body),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: authorizationHeader(),
        },
      });
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
  }

  throw new Error('Request exceeded maximum retries.');
}

export interface RequestOptions {
  isAbsolutePath?: boolean;
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
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

function authorizationHeader(): string {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const options = getOptions()!;

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
