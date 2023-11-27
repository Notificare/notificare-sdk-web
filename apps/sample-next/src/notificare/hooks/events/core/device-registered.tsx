"use client";

import { useEffect } from "react";
import { useNotificare } from "@/notificare/notificare-context";
import { OnDeviceRegisteredCallback } from "notificare-web/core";

export function useOnDeviceRegistered(callback: OnDeviceRegisteredCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "device_registered", callback });
  }, [registerListener, callback]);
}
