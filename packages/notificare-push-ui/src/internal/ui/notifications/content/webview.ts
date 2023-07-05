import { NotificareNotification } from '@notificare/core';

export async function createWebViewContent(
  notification: NotificareNotification,
): Promise<HTMLElement> {
  const content = notification.content.find(({ type }) => type === 're.notifica.content.HTML');
  if (!content) throw new Error(`Invalid content for notification '${notification.type}'.`);

  const html = `<!DOCTYPE html><html><head><title></title><meta name="viewport" content="width=device-width, maximum-scale=1, initial-scale=1, user-scalable=0"></head><body>${content.data}</body></html>`;

  const iframe = document.createElement('iframe');
  iframe.classList.add('notificare__notification-webview-iframe');
  iframe.setAttribute('srcdoc', html);

  return iframe;
}
