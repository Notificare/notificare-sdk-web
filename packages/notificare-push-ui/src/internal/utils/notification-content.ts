import { NotificareNotificationContent } from '@notificare/web-core';

export function sanitizeContentUrl(content: NotificareNotificationContent): string {
  const url = content.data?.trim();
  if (!url) return '/';

  try {
    const parsedUrl = new URL(url);

    // The URLResolver type may include an auxiliary notificareWebView parameter.
    // Remove it from the destination URL.
    parsedUrl.searchParams.delete('notificareWebView');

    return parsedUrl.toString();
  } catch {
    return url;
  }
}
