"use client";

import { useEffect } from "react";
import { useNotificare } from "@/notificare/notificare-context";
import { OnReadyCallback } from "notificare-web/core";

export function useOnReady(callback: OnReadyCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "ready", callback });
  }, [registerListener, callback]);
}
