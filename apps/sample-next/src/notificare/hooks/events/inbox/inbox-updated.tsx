"use client";

import { useEffect } from "react";
import { useNotificare } from "@/notificare/notificare-context";
import { OnInboxUpdatedCallback } from "notificare-web/inbox";

export function useOnInboxUpdated(callback: OnInboxUpdatedCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "inbox_updated", callback });
  }, [registerListener, callback]);
}
