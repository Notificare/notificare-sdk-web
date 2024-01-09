"use client";

import { useEffect } from "react";
import { OnActionFailedToExecuteCallback } from "notificare-web/in-app-messaging";
import { useNotificare } from "@/notificare/notificare-context";

export function useOnMessageActionFailedToExecute(callback: OnActionFailedToExecuteCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "message_action_failed_to_execute", callback });
  }, [registerListener, callback]);
}
