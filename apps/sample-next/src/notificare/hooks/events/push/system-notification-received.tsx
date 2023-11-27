"use client";

import { useEffect } from "react";
import { useNotificare } from "@/notificare/notificare-context";
import { OnSystemNotificationReceivedCallback } from "notificare-web/push";

export function useOnSystemNotificationReceived(callback: OnSystemNotificationReceivedCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "system_notification_received", callback });
  }, [registerListener, callback]);
}
