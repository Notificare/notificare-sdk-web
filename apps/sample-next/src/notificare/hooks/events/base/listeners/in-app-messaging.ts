import {
  OnActionExecutedCallback,
  OnActionFailedToExecuteCallback,
  OnMessageFailedToPresentCallback,
  OnMessageFinishedPresentingCallback,
  OnMessagePresentedCallback,
} from "notificare-web/in-app-messaging";
import { TypedListener } from "@/notificare/hooks/events/base";

export type NotificareInAppMessagingListener =
  | MessagePresentedListener
  | MessageFinishedPresentingListener
  | MessageFailedToPresentListener
  | MessageActionExecutedListener
  | MessageActionFailedToExecuteListener;

export type MessagePresentedListener = TypedListener<
  "message_presented",
  OnMessagePresentedCallback
>;

export type MessageFinishedPresentingListener = TypedListener<
  "message_finished_presenting",
  OnMessageFinishedPresentingCallback
>;

export type MessageFailedToPresentListener = TypedListener<
  "message_failed_to_present",
  OnMessageFailedToPresentCallback
>;

export type MessageActionExecutedListener = TypedListener<
  "message_action_executed",
  OnActionExecutedCallback
>;

export type MessageActionFailedToExecuteListener = TypedListener<
  "message_action_failed_to_execute",
  OnActionFailedToExecuteCallback
>;
