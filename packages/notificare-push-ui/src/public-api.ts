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

/**
 * Presents a notification to the user.
 *
 * This method launches the UI for displaying the provided {@link NotificareNotification}.
 *
 * @param {NotificareNotification} notification - The {@link NotificareNotification} to present.
 */
export function presentNotification(notification: NotificareNotification) {
  notificationPresenter.present(notification);
}

/**
 * Presents an action associated with a notification.
 *
 * This method presents the UI for executing a specific {@link NotificareNotificationAction}
 * associated with the provided {@link NotificareNotification}.
 *
 * @param {NotificareNotification} notification - The {@link NotificareNotification} to present.
 * @param {NotificareNotificationAction} action  - The {@link NotificareNotificationAction} to
 * execute.
 */
export function presentAction(
  notification: NotificareNotification,
  action: NotificareNotificationAction,
) {
  presentActionInternal(notification, action);
}
