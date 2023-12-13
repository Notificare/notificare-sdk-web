"use client";

import { useEffect } from "react";
import { OnNotificationSettingsChangedCallback } from "notificare-web/push";
import { useNotificare } from "@/notificare/notificare-context";

export function useOnNotificationSettingsChanged(callback: OnNotificationSettingsChangedCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "notification_settings_changed", callback });
  }, [registerListener, callback]);
}
