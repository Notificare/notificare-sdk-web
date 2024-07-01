import { NotificareNotification } from '@notificare/web-core';

export function resolveUrl(notification: NotificareNotification): UrlResolverResult {
  const content = notification.content.find(({ type }) => type === 're.notifica.content.URL');
  if (!content || !content.data) return UrlResolverResult.NONE;

  const isStringContent = typeof content.data === 'string' || content.data instanceof String;
  if (!isStringContent) return UrlResolverResult.NONE;

  const urlStr: string = content.data.toString().trim();
  if (!urlStr) return UrlResolverResult.NONE;

  if (urlStr.startsWith('/')) return UrlResolverResult.IN_APP_BROWSER;

  let url: URL;

  try {
    url = new URL(urlStr);
  } catch (e) {
    return UrlResolverResult.NONE;
  }

  const isHttpUrl = url.protocol === 'http:' || url.protocol === 'https:';
  const isDynamicLink = url.host.endsWith('ntc.re');

  if (!isHttpUrl || isDynamicLink) return UrlResolverResult.URL_SCHEME;

  const webViewQueryParameter = url.searchParams.get('notificareWebView');
  const isWebViewMode =
    webViewQueryParameter === '1' || webViewQueryParameter?.toLowerCase() === 'true';

  return isWebViewMode ? UrlResolverResult.WEB_VIEW : UrlResolverResult.IN_APP_BROWSER;
}

export enum UrlResolverResult {
  NONE,
  URL_SCHEME,
  IN_APP_BROWSER,
  WEB_VIEW,
}
