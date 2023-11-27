"use client";

import { useEffect } from "react";
import { useNotificare } from "@/notificare/notificare-context";
import { OnNotificationOpenedCallback } from "notificare-web/push";

export function useOnNotificationOpened(callback: OnNotificationOpenedCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "notification_opened", callback });
  }, [registerListener, callback]);
}
