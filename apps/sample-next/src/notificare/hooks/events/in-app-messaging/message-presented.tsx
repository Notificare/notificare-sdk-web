"use client";

import { useEffect } from "react";
import { useNotificare } from "@/notificare/notificare-context";
import { OnMessagePresentedCallback } from "notificare-web/in-app-messaging";

export function useOnMessagePresented(callback: OnMessagePresentedCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "message_presented", callback });
  }, [registerListener, callback]);
}
