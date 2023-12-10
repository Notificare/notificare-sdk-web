import { components } from './component-cache';
import { logger } from './logger';
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

export async function hasWebPushSupport(): Promise<boolean> {
  const pushComponent = components.get('push');
  if (!pushComponent) {
    logger.debug('Cannot determine web push support. Push component not found.');
    return false;
  }

  const result = await pushComponent.executeCommand('hasWebPushSupport');
  return result === true;
}

export function loadStylesheet(url: string) {
  const head = document.head ?? document.getElementsByTagName('head')[0];

  if (!head) {
    logger.warning('The document head is not defined.');
    return;
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = url;

  head.appendChild(link);
}
