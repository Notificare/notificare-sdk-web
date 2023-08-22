import { NotificareNotification, NotificareNotificationAction } from '@notificare/web-core';
import { notificationPresenter } from './internal/ui/notification-presenter';
import { presentAction as presentActionInternal } from './internal/ui/action-presenter';

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
}

export function presentAction(
  notification: NotificareNotification,
  action: NotificareNotificationAction,
) {
  presentActionInternal(notification, action);
}
