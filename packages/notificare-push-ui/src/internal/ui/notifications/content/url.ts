import { NotificareNotification } from '@notificare/core';

export async function createUrlContent(notification: NotificareNotification): Promise<HTMLElement> {
  const content = notification.content.find(({ type }) => type === 're.notifica.content.URL');
  if (!content) throw new Error(`Invalid content for notification '${notification.type}'.`);

  const iframe = document.createElement('iframe');
  iframe.classList.add('notificare__notification-url-iframe');
  iframe.setAttribute('src', content.data);

  return iframe;
}
