import {
  OnNotificationActionOpenedCallback,
  OnNotificationOpenedCallback,
  OnNotificationReceivedCallback,
  OnSystemNotificationReceivedCallback,
  OnUnknownNotificationReceivedCallback,
} from "notificare-web/push";
import { TypedListener } from "@/notificare/hooks/events/base";

export type NotificarePushListener =
  | NotificationReceivedListener
  | SystemNotificationReceivedListener
  | UnknownNotificationReceivedListener
  | NotificationOpenedListener
  | NotificationActionOpenedListener;

export type NotificationReceivedListener = TypedListener<
  "notification_received",
  OnNotificationReceivedCallback
>;

export type SystemNotificationReceivedListener = TypedListener<
  "system_notification_received",
  OnSystemNotificationReceivedCallback
>;

export type UnknownNotificationReceivedListener = TypedListener<
  "unknown_notification_received",
  OnUnknownNotificationReceivedCallback
>;

export type NotificationOpenedListener = TypedListener<
  "notification_opened",
  OnNotificationOpenedCallback
>;

export type NotificationActionOpenedListener = TypedListener<
  "notification_action_opened",
  OnNotificationActionOpenedCallback
>;
