"use client";

import { useEffect } from "react";
import { OnNotificationWillPresentCallback } from "notificare-web/push-ui";
import { useNotificare } from "@/notificare/notificare-context";

export function useOnNotificationWillPresent(callback: OnNotificationWillPresentCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "notification_will_present", callback });
  }, [registerListener, callback]);
}
