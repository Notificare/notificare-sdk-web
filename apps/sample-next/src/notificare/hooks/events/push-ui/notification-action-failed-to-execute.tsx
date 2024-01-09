"use client";

import { useEffect } from "react";
import { OnActionFailedToExecuteCallback } from "notificare-web/push-ui";
import { useNotificare } from "@/notificare/notificare-context";

export function useOnNotificationActionFailedToExecute(callback: OnActionFailedToExecuteCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "notification_action_failed_to_execute", callback });
  }, [registerListener, callback]);
}
