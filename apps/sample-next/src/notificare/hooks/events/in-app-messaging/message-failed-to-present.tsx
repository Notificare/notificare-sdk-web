"use client";

import { useEffect } from "react";
import { useNotificare } from "@/notificare/notificare-context";
import { OnMessageFailedToPresentCallback } from "notificare-web/in-app-messaging";

export function useOnMessageFailedToPresent(callback: OnMessageFailedToPresentCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "message_failed_to_present", callback });
  }, [registerListener, callback]);
}
