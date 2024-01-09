"use client";

import { useEffect } from "react";
import { OnBadgeUpdatedCallback } from "notificare-web/inbox";
import { useNotificare } from "@/notificare/notificare-context";

export function useOnBadgeUpdated(callback: OnBadgeUpdatedCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "badge_updated", callback });
  }, [registerListener, callback]);
}
