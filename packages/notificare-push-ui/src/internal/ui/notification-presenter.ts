import {
  getOptions,
  NotificareInternalOptions,
  NotificareNotification,
} from '@notificare/web-core';
import {
  notifyNotificationFailedToPresent,
  notifyNotificationFinishedPresenting,
  notifyNotificationPresented,
  notifyNotificationWillPresent,
} from '../consumer-events';
import { ensureCleanState } from './root';
import { logger } from '../../logger';
import { createNotificationModal } from './notifications/notification-modal';
import { presentAction } from './action-presenter';

class NotificationPresenter {
  private notification: NotificareNotification | undefined;

  present(notification: NotificareNotification) {
    ensureCleanState();

    notifyNotificationWillPresent(notification);

    // const application = getApplication();
    // if (!application) {
    //   logger.warning('Unable to present the notification. The cached application is unavailable.');
    //   notifyNotificationFailedToPresent(notification);
    //   return;
    // }

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
    this.notification = notification;

    this.presentNotification(notification, options)
      .then(() => {
        notifyNotificationPresented(notification);
      })
      .catch((error) => {
        logger.error('Failed to present a notification: ', error);
        notifyNotificationFailedToPresent(notification);
      });
  }

  dismiss() {
    if (this.notification) {
      notifyNotificationFinishedPresenting(this.notification);
    }

    this.notification = undefined;
    ensureCleanState();
  }

  private async presentNotification(
    notification: NotificareNotification,
    options: NotificareInternalOptions,
  ) {
    switch (notification.type) {
      case 're.notifica.notification.None':
        logger.debug(
          "Attempting to present a notification of type 'none'. These should be handled by the application instead.",
        );
        return;

      case 're.notifica.notification.InAppBrowser':
        presentInAppBrowser(notification);
        return;

      case 're.notifica.notification.URLScheme':
        presentUrlScheme(notification);
        return;

      case 're.notifica.notification.Passbook':
        presentPassbook(options, notification);
        return;

      default:
        break;
    }

    const ui = await createNotificationModal({
      notification,
      dismiss: () => this.dismiss(),
      presentAction: (action) => {
        this.dismiss();
        presentAction(notification, action);
      },
    });

    // Add the complete notification DOM to the page.
    document.body.appendChild(ui);
  }
}

export const notificationPresenter = new NotificationPresenter();

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
  if (!content) throw new Error('Invalid notification content.');

  window.open(content.data);
}

function presentPassbook(options: NotificareInternalOptions, notification: NotificareNotification) {
  const content = notification.content.find(({ type }) => type === 're.notifica.content.PKPass');
  if (!content) throw new Error('Invalid notification content.');

  const passUrlStr: string = content.data;
  const components = passUrlStr.split('/');
  if (!components.length) throw new Error('Invalid notification content.');

  const id = components[components.length - 1];
  const url = `${options.services.pushHost}/pass/web/${id}?showWebVersion=1`;

  window.open(url);
}

function presentUrlScheme(notification: NotificareNotification) {
  const content = notification.content.find(({ type }) => type === 're.notifica.content.URL');
  if (!content) throw new Error('Invalid notification content.');

  window.location.href = content.data;
}
