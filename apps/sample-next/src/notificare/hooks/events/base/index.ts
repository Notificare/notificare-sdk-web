import { v4 as uuidv4 } from "uuid";
import { NotificareCoreListener } from "@/notificare/hooks/events/base/listeners/core";
import { NotificareGeoListener } from "@/notificare/hooks/events/base/listeners/geo";
import { NotificareInAppMessagingListener } from "@/notificare/hooks/events/base/listeners/in-app-messaging";
import { NotificareInboxListener } from "@/notificare/hooks/events/base/listeners/inbox";
import { NotificarePushListener } from "@/notificare/hooks/events/base/listeners/push";
import { NotificarePushUiListener } from "@/notificare/hooks/events/base/listeners/push-ui";

export type ListenerIdentifier = string;

export function createListenerIdentifier(): ListenerIdentifier {
  return uuidv4();
}

export type IdentifiableListener = Listener & {
  identifier: ListenerIdentifier;
};

export type TypedListener<Name extends string, Callback extends Function> = {
  event: Name;
  callback: Callback;
};

export type Listener =
  | NotificareCoreListener
  | NotificareGeoListener
  | NotificareInAppMessagingListener
  | NotificareInboxListener
  | NotificarePushListener
  | NotificarePushUiListener;
