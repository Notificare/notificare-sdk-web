"use client";

import { useEffect } from "react";
import { useNotificare } from "@/notificare/notificare-context";
import { OnUnknownNotificationReceivedCallback } from "notificare-web/push";

export function useOnUnknownNotificationReceived(callback: OnUnknownNotificationReceivedCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "unknown_notification_received", callback });
  }, [registerListener, callback]);
}
