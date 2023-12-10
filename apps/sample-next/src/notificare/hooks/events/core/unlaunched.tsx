"use client";

import { useEffect } from "react";
import { OnUnlaunchedCallback } from "notificare-web/core";
import { useNotificare } from "@/notificare/notificare-context";

export function useOnUnlaunched(callback: OnUnlaunchedCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "unlaunched", callback });
  }, [registerListener, callback]);
}
