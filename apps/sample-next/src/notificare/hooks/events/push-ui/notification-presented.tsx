"use client";

import { useEffect } from "react";
import { OnNotificationPresentedCallback } from "notificare-web/push-ui";
import { useNotificare } from "@/notificare/notificare-context";

export function useOnNotificationPresented(callback: OnNotificationPresentedCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "notification_presented", callback });
  }, [registerListener, callback]);
}
