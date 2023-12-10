"use client";

import { useEffect } from "react";
import { OnNotificationFinishedPresentingCallback } from "notificare-web/push-ui";
import { useNotificare } from "@/notificare/notificare-context";

export function useOnNotificationFinishedPresenting(
  callback: OnNotificationFinishedPresentingCallback,
) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "notification_finished_presenting", callback });
  }, [registerListener, callback]);
}
