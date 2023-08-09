import { NotificareNotification } from '@notificare/web-core';

export async function createAlertContent(
  notification: NotificareNotification,
): Promise<HTMLElement> {
  const container = document.createElement('div');
  container.classList.add('notificare__notification-alert');

  const attachment = createAttachmentSection(notification);
  if (attachment) container.appendChild(attachment);

  if (notification.title) {
    const title = container.appendChild(document.createElement('p'));
    title.classList.add('notificare__notification-alert-title');
    title.innerHTML = notification.title;
  }

  if (notification.subtitle) {
    const subtitle = container.appendChild(document.createElement('p'));
    subtitle.classList.add('notificare__notification-content-subtitle');
    subtitle.innerHTML = notification.subtitle;
  }

  const message = container.appendChild(document.createElement('p'));
  message.classList.add('notificare__notification-alert-message');
  message.innerHTML = notification.message;

  return container;
}

function createAttachmentSection(notification: NotificareNotification): HTMLElement | undefined {
  const attachment = notification.attachments.find(({ mimeType }) => /image/.test(mimeType));
  if (!attachment) return undefined;

  const element = document.createElement('img');
  element.classList.add('notificare__notification-alert-attachment');
  element.setAttribute('src', attachment.uri);

  return element;
}
