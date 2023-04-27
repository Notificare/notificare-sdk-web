import { getApplication, getOptions, NotificareNotification } from '@notificare/core';
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

  const backdrop = document.createElement('div');
  backdrop.id = 'notificare-push-ui';
  backdrop.classList.add('notificare', 'notificare__notification-backdrop');

  const modal = document.createElement('div');
  modal.classList.add('notificare__notification');
  backdrop.appendChild(modal);

  const header = document.createElement('div');
  header.classList.add('notificare__notification-header');
  modal.appendChild(header);

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
  headerCloseButton.addEventListener('click', onCloseButtonClicked);
  header.appendChild(headerCloseButton);

  const attachmentImage = notification.attachments.find(({ mimeType }) => /image/.test(mimeType));
  if (attachmentImage) {
    const attachment = document.createElement('img');
    attachment.classList.add('notificare__notification-attachment');
    attachment.setAttribute('src', attachmentImage.uri);
    modal.appendChild(attachment);
  }

  const content = document.createElement('div');
  content.classList.add('notificare__notification-content');
  modal.appendChild(content);

  if (notification.title) {
    const contentTitle = document.createElement('p');
    contentTitle.classList.add('notificare__notification-content-title');
    contentTitle.innerHTML = notification.title;
    content.appendChild(contentTitle);
  }

  if (notification.subtitle) {
    const contentSubtitle = document.createElement('p');
    contentSubtitle.classList.add('notificare__notification-content-subtitle');
    contentSubtitle.innerHTML = notification.subtitle;
    content.appendChild(contentSubtitle);
  }

  const contentMessage = document.createElement('p');
  contentMessage.classList.add('notificare__notification-content-message');
  contentMessage.innerHTML = notification.message;
  content.appendChild(contentMessage);

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

function ensureCleanState() {
  const root = document.getElementById('notificare-push-ui');
  if (root) root.remove();
}

function onCloseButtonClicked() {
  //
  ensureCleanState();
}
