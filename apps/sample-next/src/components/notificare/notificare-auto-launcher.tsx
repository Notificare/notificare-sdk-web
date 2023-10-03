"use client";

import { useEffect, useRef } from "react";
import { useLaunchFlow } from "@/context/launch-flow";
import { configure, setLogLevel } from "notificare-web/core";

export function NotificareAutoLauncher() {
  const { launch } = useLaunchFlow();
  const autoLaunched = useRef(false);

  useEffect(() => {
    // Strict mode will (un)mount each component twice.
    // Prevent the configuration from running in duplicate.
    if (autoLaunched.current) return;

    const encodedConfig = localStorage.getItem("app_configuration");
    if (!encodedConfig) return;

    const config = JSON.parse(encodedConfig);
    setLogLevel(config.debugLoggingEnabled ? "debug" : "info");
    configure(config);

    launch();
    autoLaunched.current = true;
  }, [launch]);

  return null;
}
