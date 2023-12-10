"use client";

import { useEffect } from "react";
import { OnMessagePresentedCallback } from "notificare-web/in-app-messaging";
import { useNotificare } from "@/notificare/notificare-context";

export function useOnMessagePresented(callback: OnMessagePresentedCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "message_presented", callback });
  }, [registerListener, callback]);
}
