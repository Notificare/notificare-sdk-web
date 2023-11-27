"use client";

import { useEffect } from "react";
import { useNotificare } from "@/notificare/notificare-context";
import { OnActionWillExecuteCallback } from "notificare-web/push-ui";

export function useOnNotificationActionWillExecute(callback: OnActionWillExecuteCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "notification_action_will_execute", callback });
  }, [registerListener, callback]);
}
