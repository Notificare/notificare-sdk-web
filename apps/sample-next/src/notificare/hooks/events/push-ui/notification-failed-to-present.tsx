"use client";

import { useEffect } from "react";
import { OnNotificationFailedToPresentCallback } from "notificare-web/push-ui";
import { useNotificare } from "@/notificare/notificare-context";

export function useOnNotificationFailedToPresent(callback: OnNotificationFailedToPresentCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "notification_failed_to_present", callback });
  }, [registerListener, callback]);
}
