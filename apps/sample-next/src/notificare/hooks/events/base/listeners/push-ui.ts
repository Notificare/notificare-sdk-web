import {
  OnActionExecutedCallback,
  OnActionFailedToExecuteCallback,
  OnActionWillExecuteCallback,
  OnCustomActionReceivedCallback,
  OnNotificationFailedToPresentCallback,
  OnNotificationFinishedPresentingCallback,
  OnNotificationPresentedCallback,
  OnNotificationWillPresentCallback,
} from "notificare-web/push-ui";
import { TypedListener } from "@/notificare/hooks/events/base";

export type NotificarePushUiListener =
  | NotificationWillPresentListener
  | NotificationPresentedListener
  | NotificationFinishedPresentingListener
  | NotificationFailedToPresentListener
  | NotificationActionWillExecuteListener
  | NotificationActionExecutedListener
  | NotificationActionFailedToExecuteListener
  | NotificationCustomActionReceivedListener;

export type NotificationWillPresentListener = TypedListener<
  "notification_will_present",
  OnNotificationWillPresentCallback
>;

export type NotificationPresentedListener = TypedListener<
  "notification_presented",
  OnNotificationPresentedCallback
>;

export type NotificationFinishedPresentingListener = TypedListener<
  "notification_finished_presenting",
  OnNotificationFinishedPresentingCallback
>;

export type NotificationFailedToPresentListener = TypedListener<
  "notification_failed_to_present",
  OnNotificationFailedToPresentCallback
>;

export type NotificationActionWillExecuteListener = TypedListener<
  "notification_action_will_execute",
  OnActionWillExecuteCallback
>;

export type NotificationActionExecutedListener = TypedListener<
  "notification_action_executed",
  OnActionExecutedCallback
>;

export type NotificationActionFailedToExecuteListener = TypedListener<
  "notification_action_failed_to_execute",
  OnActionFailedToExecuteCallback
>;

export type NotificationCustomActionReceivedListener = TypedListener<
  "notification_custom_action_received",
  OnCustomActionReceivedCallback
>;
