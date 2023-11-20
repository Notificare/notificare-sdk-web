"use client";

import { useEffect } from "react";
import { useNotificare } from "@/notificare/notificare-context";
import { OnUnlaunchedCallback } from "notificare-web/core";

export function useOnUnlaunched(callback: OnUnlaunchedCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "unlaunched", callback });
  }, [registerListener, callback]);
}
