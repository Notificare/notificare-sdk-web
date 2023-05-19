import {
  getApplication,
  getOptions,
  NotificareInternalOptions,
  NotificareNotification,
} from '@notificare/core';
import { logger } from './logger';
import { createNotificationContainer } from './internal/notification-ui';
import {
  notifyNotificationFailedToPresent,
  notifyNotificationFinishedPresenting,
  notifyNotificationPresented,
  notifyNotificationWillPresent,
} from './internal/consumer-events';

export {
  onNotificationWillPresent,
  onNotificationPresented,
  onNotificationFinishedPresenting,
  onNotificationFailedToPresent,
  onActionWillExecute,
  onActionExecuted,
  onActionFailedToExecute,
  onCustomActionReceived,
} from './internal/consumer-events';

export function presentNotification(notification: NotificareNotification) {
  ensureCleanState();

  notifyNotificationWillPresent(notification);

  const application = getApplication();
  if (!application) {
    logger.warning('Unable to present the notification. The cached application is unavailable.');
    notifyNotificationFailedToPresent(notification);
    return;
  }

  const options = getOptions();
  if (!options) {
    logger.warning('Unable to present the notification. Notificare is not configured.');
    notifyNotificationFailedToPresent(notification);
    return;
  }

  if (!checkNotificationSupport(notification)) {
    logger.warning(
      `Unable to present the notification. Unsupported notification type '${notification.type}'.`,
    );
    notifyNotificationFailedToPresent(notification);
    return;
  }

  logger.debug(`Presenting notification '${notification.id}'.`);

  switch (notification.type) {
    case 're.notifica.notification.None':
      logger.debug(
        "Attempting to present a notification of type 'none'. These should be handled by the application instead.",
      );
      notifyNotificationPresented(notification);
      return;

    case 're.notifica.notification.InAppBrowser':
      presentInAppBrowser(notification);
      notifyNotificationPresented(notification);
      return;

    case 're.notifica.notification.URLScheme':
      presentUrlScheme(notification);
      notifyNotificationPresented(notification);
      return;

    case 're.notifica.notification.Passbook':
      presentPassbook(options, notification);
      notifyNotificationPresented(notification);
      return;

    default:
      break;
  }

  createNotificationContainer(
    options,
    application,
    notification,
    () => {
      ensureCleanState();
      notifyNotificationFinishedPresenting(notification);
    },
    (action) => {},
  )
    .then((container) => {
      // Add the complete notification DOM to the page.
      document.body.appendChild(container);

      notifyNotificationPresented(notification);
    })
    .catch((error) => {
      logger.error('Failed to present a notification: ', error);
      notifyNotificationFailedToPresent(notification);
    });
}

function ensureCleanState() {
  const root = document.getElementById('notificare-push-ui');
  if (root) root.remove();
}

function checkNotificationSupport(notification: NotificareNotification): boolean {
  switch (notification.type) {
    case 're.notifica.notification.None':
    case 're.notifica.notification.Alert':
    case 're.notifica.notification.Image':
    case 're.notifica.notification.InAppBrowser':
    case 're.notifica.notification.Map':
    case 're.notifica.notification.Passbook':
    case 're.notifica.notification.URL':
    case 're.notifica.notification.URLScheme':
    case 're.notifica.notification.Video':
    case 're.notifica.notification.WebView':
      return true;
    default:
      return false;
  }
}

function presentInAppBrowser(notification: NotificareNotification) {
  const content = notification.content.find(({ type }) => type === 're.notifica.content.URL');
  if (!content) {
    // TODO: this should fail to present the notification.
    return;
  }

  window.open(content.data);
}

function presentPassbook(options: NotificareInternalOptions, notification: NotificareNotification) {
  const content = notification.content.find(({ type }) => type === 're.notifica.content.PKPass');
  if (!content) {
    // TODO: this should fail to present the notification.
    return;
  }

  const passUrlStr: string = content.data;
  const components = passUrlStr.split('/');
  if (!components.length) {
    // TODO: this should fail to present the notification.
    return;
  }

  const id = components[components.length - 1];
  const url = `${options.services.pushHost}/pass/web/${id}?showWebVersion=1`;

  window.open(url);
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
