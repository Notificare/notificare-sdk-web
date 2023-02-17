import { getOptions } from './options';

export function randomUUID(): string {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    // eslint-disable-next-line no-bitwise
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16),
  );
}

export function getTimeZoneOffset(): number {
  const now = new Date();
  return (now.getTimezoneOffset() / 60) * -1;
}

export function getApplicationVersion(): string {
  return getOptions()?.applicationVersion ?? '1.0.0';
}

export function getBrowserLanguage(): string {
  const language = 'en';

  // Not using userLanguage anymore since it's deprecated, and it reflects the language
  // of the OS instead of the browser.
  const browserLanguage = window.navigator.language;
  if (!browserLanguage) return language;

  const parts = browserLanguage.split('-');
  if (parts.length > 0) return parts[0].toLowerCase();

  return language;
}

export function getBrowserRegion(): string {
  const language = 'US';

  // Not using userLanguage anymore since it's deprecated, and it reflects the language
  // of the OS instead of the browser.
  const browserLanguage = window.navigator.language;
  if (!browserLanguage) return language;

  const parts = browserLanguage.split('-');
  if (parts.length > 1) return parts[1].toUpperCase();

  return language;
}
