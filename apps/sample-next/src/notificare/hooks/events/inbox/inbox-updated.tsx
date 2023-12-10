"use client";

import { useEffect } from "react";
import { OnInboxUpdatedCallback } from "notificare-web/inbox";
import { useNotificare } from "@/notificare/notificare-context";

export function useOnInboxUpdated(callback: OnInboxUpdatedCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "inbox_updated", callback });
  }, [registerListener, callback]);
}
