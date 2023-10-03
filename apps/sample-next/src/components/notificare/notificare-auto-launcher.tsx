"use client";

import { useEffect, useRef } from "react";
import { useLaunchFlow } from "@/context/launch-flow";

export function NotificareAutoLauncher() {
  const { launch } = useLaunchFlow();
  const autoLaunched = useRef(false);

  useEffect(() => {
    // Strict mode will (un)mount each component twice.
    // Prevent the configuration from running in duplicate.
    if (autoLaunched.current) return;

    launch();
    autoLaunched.current = true;
  }, [launch]);

  return null;
}
