"use client";

import { PropsWithChildren, useEffect, useState } from "react";
import { Alert } from "@/components/alert";

export function NotificareConfigurationBlocker({ children }: PropsWithChildren) {
  const [config, setConfig] = useState<string | null>();

  useEffect(function loadConfig() {
    const config = localStorage.getItem("app_configuration");
    setConfig(config);
  }, []);

  return (
    <>
      {config === null && (
        <Alert
          variant="warning"
          message="Your environment is not configured."
          action={{
            label: "Configure",
            url: "/setup",
          }}
        />
      )}

      {config && <>{children}</>}
    </>
  );
}
