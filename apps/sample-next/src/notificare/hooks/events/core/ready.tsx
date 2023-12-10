"use client";

import { useEffect } from "react";
import { OnReadyCallback } from "notificare-web/core";
import { useNotificare } from "@/notificare/notificare-context";

export function useOnReady(callback: OnReadyCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "ready", callback });
  }, [registerListener, callback]);
}
