"use client";

import { useEffect } from "react";
import { OnNotificationActionOpenedCallback } from "notificare-web/push";
import { useNotificare } from "@/notificare/notificare-context";

export function useOnNotificationActionOpened(callback: OnNotificationActionOpenedCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "notification_action_opened", callback });
  }, [registerListener, callback]);
}
