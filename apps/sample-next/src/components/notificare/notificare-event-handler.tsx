"use client";

import { presentAction, presentNotification } from "notificare-web/push-ui";
import { useOnNotificationActionOpened } from "@/notificare/hooks/events/push/notification-action-opened";
import { useOnNotificationOpened } from "@/notificare/hooks/events/push/notification-opened";
import { useOnNotificationCustomActionReceived } from "@/notificare/hooks/events/push-ui/notification-custom-action-received";

export function NotificareEventHandler() {
  useOnNotificationOpened((notification) => {
    presentNotification(notification);
  });

  useOnNotificationActionOpened((notification, action) => {
    presentAction(notification, action);
  });

  useOnNotificationCustomActionReceived((notification, action, target) => {
    window.location.href = target;
  });

  return null;
}
