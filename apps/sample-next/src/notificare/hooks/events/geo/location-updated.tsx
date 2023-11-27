"use client";

import { useEffect } from "react";
import { useNotificare } from "@/notificare/notificare-context";
import { OnLocationUpdatedCallback } from "notificare-web/geo";

export function useOnLocationUpdated(callback: OnLocationUpdatedCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "location_updated", callback });
  }, [registerListener, callback]);
}
