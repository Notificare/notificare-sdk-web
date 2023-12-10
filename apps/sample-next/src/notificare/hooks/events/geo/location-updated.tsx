"use client";

import { useEffect } from "react";
import { OnLocationUpdatedCallback } from "notificare-web/geo";
import { useNotificare } from "@/notificare/notificare-context";

export function useOnLocationUpdated(callback: OnLocationUpdatedCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "location_updated", callback });
  }, [registerListener, callback]);
}
