import { NotificareNotification, NotificareNotificationAction } from '@notificare/web-core';
import { presentAction as presentActionInternal } from './internal/ui/action-presenter';
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
  OnNotificationWillPresentCallback,
  OnNotificationPresentedCallback,
  OnNotificationFinishedPresentingCallback,
  OnNotificationFailedToPresentCallback,
  OnActionWillExecuteCallback,
  OnActionExecutedCallback,
  OnActionFailedToExecuteCallback,
  OnCustomActionReceivedCallback,
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
