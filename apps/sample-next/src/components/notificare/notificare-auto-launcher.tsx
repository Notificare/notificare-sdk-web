"use client";

import { useEffect, useRef } from "react";
import { configure, setLogLevel } from "notificare-web/core";
import { useSampleUser } from "@/hooks/sample-user";
import { useNotificareLaunchFlow } from "@/notificare/hooks/notificare-launch-flow";

export function NotificareAutoLauncher() {
  useSampleUser();

  const { launch } = useNotificareLaunchFlow();
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
