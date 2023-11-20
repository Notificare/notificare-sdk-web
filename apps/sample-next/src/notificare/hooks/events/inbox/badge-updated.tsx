"use client";

import { useEffect } from "react";
import { useNotificare } from "@/notificare/notificare-context";
import { OnBadgeUpdatedCallback } from "notificare-web/inbox";

export function useOnBadgeUpdated(callback: OnBadgeUpdatedCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "badge_updated", callback });
  }, [registerListener, callback]);
}
