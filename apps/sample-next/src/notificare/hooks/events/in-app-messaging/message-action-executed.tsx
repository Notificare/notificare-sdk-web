"use client";

import { useEffect } from "react";
import { OnActionExecutedCallback } from "notificare-web/in-app-messaging";
import { useNotificare } from "@/notificare/notificare-context";

export function useOnMessageActionExecuted(callback: OnActionExecutedCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "message_action_executed", callback });
  }, [registerListener, callback]);
}
