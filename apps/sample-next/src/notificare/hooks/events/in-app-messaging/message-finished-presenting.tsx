"use client";

import { useEffect } from "react";
import { OnMessageFinishedPresentingCallback } from "notificare-web/in-app-messaging";
import { useNotificare } from "@/notificare/notificare-context";

export function useOnMessageFinishedPresenting(callback: OnMessageFinishedPresentingCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "message_finished_presenting", callback });
  }, [registerListener, callback]);
}
