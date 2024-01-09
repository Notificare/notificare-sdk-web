"use client";

import { useEffect } from "react";
import { OnSystemNotificationReceivedCallback } from "notificare-web/push";
import { useNotificare } from "@/notificare/notificare-context";

export function useOnSystemNotificationReceived(callback: OnSystemNotificationReceivedCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "system_notification_received", callback });
  }, [registerListener, callback]);
}
