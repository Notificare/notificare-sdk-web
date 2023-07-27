import { NotificareNotification, NotificareNotificationAction } from '@notificare/core';
import { presentActionInternal } from './internal/actions-ui';
import { notificationPresenter } from './internal/ui/notification-presenter';

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
  notificationPresenter.present(notification);

  // ensureCleanState();
  //
  // notifyNotificationWillPresent(notification);
  //
  // const application = getApplication();
  // if (!application) {
  //   logger.warning('Unable to present the notification. The cached application is unavailable.');
  //   notifyNotificationFailedToPresent(notification);
  //   return;
  // }
  //
  // const options = getOptions();
  // if (!options) {
  //   logger.warning('Unable to present the notification. Notificare is not configured.');
  //   notifyNotificationFailedToPresent(notification);
  //   return;
  // }
  //
  // if (!checkNotificationSupport(notification)) {
  //   logger.warning(
  //     `Unable to present the notification. Unsupported notification type '${notification.type}'.`,
  //   );
  //   notifyNotificationFailedToPresent(notification);
  //   return;
  // }
  //
  // logger.debug(`Presenting notification '${notification.id}'.`);
  //
  // switch (notification.type) {
  //   case 're.notifica.notification.None':
  //     logger.debug(
  //       "Attempting to present a notification of type 'none'. These should be handled by the application instead.",
  //     );
  //     notifyNotificationPresented(notification);
  //     return;
  //
  //   case 're.notifica.notification.InAppBrowser':
  //     presentInAppBrowser(notification);
  //     notifyNotificationPresented(notification);
  //     return;
  //
  //   case 're.notifica.notification.URLScheme':
  //     presentUrlScheme(notification);
  //     notifyNotificationPresented(notification);
  //     return;
  //
  //   case 're.notifica.notification.Passbook':
  //     presentPassbook(options, notification);
  //     notifyNotificationPresented(notification);
  //     return;
  //
  //   default:
  //     break;
  // }
  //
  // createNotificationModal({
  //   notification,
  //   dismiss: () => {
  //     notifyNotificationFinishedPresenting(notification);
  //     ensureCleanState();
  //   },
  // })
  //   .then((container) => {
  //     // Add the complete notification DOM to the page.
  //     document.body.appendChild(container);
  //
  //     notifyNotificationPresented(notification);
  //   })
  //   .catch((error) => {
  //     logger.error('Failed to present a notification: ', error);
  //     notifyNotificationFailedToPresent(notification);
  //   });

  // createNotificationContainer(
  //   options,
  //   application,
  //   notification,
  //   () => {
  //     ensureCleanState();
  //     notifyNotificationFinishedPresenting(notification);
  //   },
  //   (action) => {
  //     ensureCleanState();
  //     notifyNotificationFinishedPresenting(notification);
  //     presentAction(notification, action);
  //   },
  // )
  //   .then((container) => {
  //     // Add the complete notification DOM to the page.
  //     document.body.appendChild(container);
  //
  //     notifyNotificationPresented(notification);
  //   })
  //   .catch((error) => {
  //     logger.error('Failed to present a notification: ', error);
  //     notifyNotificationFailedToPresent(notification);
  //   });
}

export function presentAction(
  notification: NotificareNotification,
  action: NotificareNotificationAction,
) {
  presentActionInternal(notification, action);
}
