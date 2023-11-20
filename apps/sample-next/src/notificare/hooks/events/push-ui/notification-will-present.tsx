"use client";

import { useEffect } from "react";
import { useNotificare } from "@/notificare/notificare-context";
import { OnNotificationWillPresentCallback } from "notificare-web/push-ui";

export function useOnNotificationWillPresent(callback: OnNotificationWillPresentCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "notification_will_present", callback });
  }, [registerListener, callback]);
}
