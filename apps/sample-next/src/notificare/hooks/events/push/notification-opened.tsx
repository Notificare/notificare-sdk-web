"use client";

import { useEffect } from "react";
import { OnNotificationOpenedCallback } from "notificare-web/push";
import { useNotificare } from "@/notificare/notificare-context";

export function useOnNotificationOpened(callback: OnNotificationOpenedCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "notification_opened", callback });
  }, [registerListener, callback]);
}
