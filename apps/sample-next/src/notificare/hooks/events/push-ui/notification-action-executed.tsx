"use client";

import { useEffect } from "react";
import { OnActionExecutedCallback } from "notificare-web/push-ui";
import { useNotificare } from "@/notificare/notificare-context";

export function useOnNotificationActionExecuted(callback: OnActionExecutedCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "notification_action_executed", callback });
  }, [registerListener, callback]);
}
