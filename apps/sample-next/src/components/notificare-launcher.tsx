"use client";

import { useEffect } from "react";
import { useNotificare } from "@/hooks/use-notificare";
import { onNotificationOpened } from "@notificare/push";
import { presentNotification } from "@notificare/push-ui";

export function NotificareLauncher() {
  useNotificare();

  useEffect(function setupListeners() {
    const subscriptions = [
      onNotificationOpened((notification) => {
        presentNotification(notification);
      }),
    ];

    return () => subscriptions.forEach((subscription) => subscription.remove());
  }, []);

  return <></>;
}
