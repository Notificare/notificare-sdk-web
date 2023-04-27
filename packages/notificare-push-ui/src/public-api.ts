import {
  getApplication,
  getOptions,
  NotificareApplication,
  NotificareInternalOptions,
  NotificareNotification,
} from '@notificare/core';
import { logger } from './logger';

export function presentNotification(notification: NotificareNotification) {
  ensureCleanState();

  const application = getApplication();
  if (!application) {
    logger.warning('Unable to present the notification. The cached application is unavailable.');
    return;
  }

  const options = getOptions();
  if (!options) {
    logger.warning('Unable to present the notification. Notificare is not configured.');
    return;
  }

  if (notification.type === 're.notifica.notification.URLScheme') {
    presentUrlScheme(notification);
    return;
  }

  const backdrop = document.createElement('div');
  backdrop.id = 'notificare-push-ui';
  backdrop.classList.add('notificare', 'notificare__notification-backdrop');
  backdrop.addEventListener('click', (e) => {
    if (e.defaultPrevented) return;

    dismissNotificationUI();
  });

  const modal = document.createElement('div');
  modal.classList.add('notificare__notification');
  modal.setAttribute('data-notification-type', notification.type);
  modal.addEventListener('click', (e) => {
    // Prevent the backdrop click to dismiss from receiving events when
    // the notification content is clicked.
    e.preventDefault();
  });
  backdrop.appendChild(modal);

  const header = createHeader(options, application);
  modal.appendChild(header);

  const attachmentImage = createAttachmentElement(notification);
  if (attachmentImage) modal.appendChild(attachmentImage);

  const content = createContentElement(notification);
  modal.appendChild(content);

  if (notification.actions.length) {
    const actionsContainer = document.createElement('div');
    actionsContainer.classList.add('notificare__notification-actions');
    modal.appendChild(actionsContainer);

    notification.actions.forEach((action) => {
      const actionButton = document.createElement('a');
      actionButton.classList.add('notificare__notification-action-button');
      actionButton.innerHTML = action.label;

      if (action.destructive) {
        actionButton.classList.add('notificare__notification-action-button__destructive');
      }

      actionsContainer.appendChild(actionButton);
    });
  }

  // Add the complete notification DOM to the page.
  document.body.appendChild(backdrop);
}

function presentUrlScheme(notification: NotificareNotification) {
  if (notification.type !== 're.notifica.notification.URLScheme') return;

  const content = notification.content.find(({ type }) => type === 're.notifica.content.URL');
  if (!content) {
    logger.warning('Unable to present the notification. No URL content available.');
    return;
  }

  window.location.href = content.data;
}

function ensureCleanState() {
  const root = document.getElementById('notificare-push-ui');
  if (root) root.remove();
}

function dismissNotificationUI() {
  ensureCleanState();
}

function createHeader(
  options: NotificareInternalOptions,
  application: NotificareApplication,
): HTMLElement {
  const header = document.createElement('div');
  header.classList.add('notificare__notification-header');

  const headerLogo = document.createElement('img');
  headerLogo.classList.add('notificare__notification-header-logo');

  if (application.websitePushConfig?.icon) {
    headerLogo.setAttribute(
      'src',
      `${options.services.awsStorageHost}${application.websitePushConfig.icon}`,
    );
  }

  header.appendChild(headerLogo);

  const headerTitle = document.createElement('p');
  headerTitle.classList.add('notificare__notification-header-title');
  headerTitle.innerHTML = application.name;
  header.appendChild(headerTitle);

  const headerCloseButton = document.createElement('div');
  headerCloseButton.classList.add('notificare__notification-header-close-button');
  headerCloseButton.addEventListener('click', dismissNotificationUI);
  header.appendChild(headerCloseButton);

  return header;
}

function createAttachmentElement(notification: NotificareNotification): HTMLElement | undefined {
  if (notification.type !== 're.notifica.notification.Alert') return undefined;

  const attachment = notification.attachments.find(({ mimeType }) => /image/.test(mimeType));
  if (!attachment) return undefined;

  const element = document.createElement('img');
  element.classList.add('notificare__notification-attachment');
  element.setAttribute('src', attachment.uri);

  return element;
}

function createContentElement(notification: NotificareNotification): HTMLElement {
  const content = document.createElement('div');
  content.classList.add('notificare__notification-content');

  switch (notification.type) {
    case 're.notifica.notification.Alert':
      populateContentWithAlert(notification, content);
      break;

    case 're.notifica.notification.URL':
      populateContentWithUrl(notification, content);
      break;

    case 're.notifica.notification.WebView':
      populateContentWithWebView(notification, content);
      break;

    default:
      logger.warning(`Unsupported notification type: ${notification.type}`);
  }

  return content;
}

function populateContentWithAlert(notification: NotificareNotification, container: HTMLElement) {
  if (notification.title) {
    const contentTitle = document.createElement('p');
    contentTitle.classList.add('notificare__notification-content-title');
    contentTitle.innerHTML = notification.title;
    container.appendChild(contentTitle);
  }

  if (notification.subtitle) {
    const contentSubtitle = document.createElement('p');
    contentSubtitle.classList.add('notificare__notification-content-subtitle');
    contentSubtitle.innerHTML = notification.subtitle;
    container.appendChild(contentSubtitle);
  }

  const contentMessage = document.createElement('p');
  contentMessage.classList.add('notificare__notification-content-message');
  contentMessage.innerHTML = notification.message;
  container.appendChild(contentMessage);
}

function populateContentWithUrl(notification: NotificareNotification, container: HTMLElement) {
  const content = notification.content.find(({ type }) => type === 're.notifica.content.URL');
  if (!content) {
    // TODO: this should fail to present the notification.
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.classList.add('notificare__notification-content-iframe');
  iframe.setAttribute('src', content.data);
  container.appendChild(iframe);
}

function populateContentWithWebView(notification: NotificareNotification, container: HTMLElement) {
  const content = notification.content.find(({ type }) => type === 're.notifica.content.HTML');
  if (!content) {
    // TODO: this should fail to present the notification.
    return;
  }

  const html = `<!DOCTYPE html><html><head><title></title><meta name="viewport" content="width=device-width, maximum-scale=1, initial-scale=1, user-scalable=0"></head><body>${content.data}</body></html>`;

  const iframe = document.createElement('iframe');
  iframe.classList.add('notificare__notification-content-iframe');
  iframe.setAttribute('srcdoc', html);
  container.appendChild(iframe);
}
