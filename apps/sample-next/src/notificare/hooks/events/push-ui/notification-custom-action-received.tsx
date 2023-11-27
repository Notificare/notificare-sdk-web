"use client";

import { useEffect } from "react";
import { useNotificare } from "@/notificare/notificare-context";
import { OnCustomActionReceivedCallback } from "notificare-web/push-ui";

export function useOnNotificationCustomActionReceived(callback: OnCustomActionReceivedCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "notification_custom_action_received", callback });
  }, [registerListener, callback]);
}
