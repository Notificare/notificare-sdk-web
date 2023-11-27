"use client";

import { useEffect } from "react";
import { useNotificare } from "@/notificare/notificare-context";
import { OnNotificationReceivedCallback } from "notificare-web/push";

export function useOnNotificationReceived(callback: OnNotificationReceivedCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "notification_received", callback });
  }, [registerListener, callback]);
}
