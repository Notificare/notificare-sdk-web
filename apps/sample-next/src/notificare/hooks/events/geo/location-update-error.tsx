"use client";

import { useEffect } from "react";
import { OnLocationUpdateErrorCallback } from "notificare-web/geo";
import { useNotificare } from "@/notificare/notificare-context";

export function useOnLocationUpdateError(callback: OnLocationUpdateErrorCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "location_update_error", callback });
  }, [registerListener, callback]);
}
