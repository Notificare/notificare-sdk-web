"use client";

import { useEffect } from "react";
import { OnCustomActionReceivedCallback } from "notificare-web/push-ui";
import { useNotificare } from "@/notificare/notificare-context";

export function useOnNotificationCustomActionReceived(callback: OnCustomActionReceivedCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "notification_custom_action_received", callback });
  }, [registerListener, callback]);
}
