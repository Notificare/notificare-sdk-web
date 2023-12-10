"use client";

import { useEffect } from "react";
import { OnUnknownNotificationReceivedCallback } from "notificare-web/push";
import { useNotificare } from "@/notificare/notificare-context";

export function useOnUnknownNotificationReceived(callback: OnUnknownNotificationReceivedCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "unknown_notification_received", callback });
  }, [registerListener, callback]);
}
