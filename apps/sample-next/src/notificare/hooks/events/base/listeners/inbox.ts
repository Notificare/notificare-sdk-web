import { OnBadgeUpdatedCallback, OnInboxUpdatedCallback } from "notificare-web/inbox";
import { TypedListener } from "@/notificare/hooks/events/base";

export type NotificareInboxListener = InboxUpdatedListener | BadgeUpdatedListener;

export type InboxUpdatedListener = TypedListener<"inbox_updated", OnInboxUpdatedCallback>;

export type BadgeUpdatedListener = TypedListener<"badge_updated", OnBadgeUpdatedCallback>;
