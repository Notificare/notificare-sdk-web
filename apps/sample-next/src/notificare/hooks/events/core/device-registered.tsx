"use client";

import { useEffect } from "react";
import { OnDeviceRegisteredCallback } from "notificare-web/core";
import { useNotificare } from "@/notificare/notificare-context";

export function useOnDeviceRegistered(callback: OnDeviceRegisteredCallback) {
  const { registerListener } = useNotificare();

  useEffect(() => {
    return registerListener({ event: "device_registered", callback });
  }, [registerListener, callback]);
}
