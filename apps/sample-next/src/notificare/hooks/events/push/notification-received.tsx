"use client";

import { useEffect } from "react";
import { OnNotificationReceivedCallback } from "notificare-web/push";
import { useNotificare } from "@/notificare/notificare-context";

export function useOnNotificationReceived(callback: OnNotificationReceivedCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "notification_received", callback });
  }, [registerListener, callback]);
}
