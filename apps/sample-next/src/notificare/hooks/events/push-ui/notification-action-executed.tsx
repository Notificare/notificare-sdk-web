"use client";

import { useEffect } from "react";
import { useNotificare } from "@/notificare/notificare-context";
import { OnActionExecutedCallback } from "notificare-web/push-ui";

export function useOnNotificationActionExecuted(callback: OnActionExecutedCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "notification_action_executed", callback });
  }, [registerListener, callback]);
}
