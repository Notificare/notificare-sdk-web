"use client";

import { PropsWithChildren } from "react";
import { Alert } from "@/components/alert";
import { NotificareConfigurationBlocker } from "@/components/notificare/notificare-configuration-blocker";
import { ProgressIndicator } from "@/components/progress-indicator";
import { useNotificareLaunchFlow } from "@/notificare/hooks/notificare-launch-flow";

export function NotificareLaunchBlocker({ children }: PropsWithChildren) {
  const { state, launch } = useNotificareLaunchFlow();

  return (
    <NotificareConfigurationBlocker>
      {state.status === "idle" && (
        <Alert
          variant="warning"
          message="Notificare is idle."
          action={{
            label: "Launch",
            onClick: () => launch(),
          }}
        />
      )}

      {state.status === "launching" && (
        <ProgressIndicator
          title="Launch flow in progress"
          message="Wait a moment while Notificare finishes launching."
        />
      )}

      {state.status === "launched" && <>{children}</>}

      {state.status === "unlaunching" && (
        <ProgressIndicator
          title="Unlaunch flow in progress"
          message="Wait a moment while Notificare finishes unlaunching."
        />
      )}
    </NotificareConfigurationBlocker>
  );
}
