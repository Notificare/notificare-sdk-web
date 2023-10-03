"use client";

import { PropsWithChildren } from "react";
import { Alert } from "@/components/alert";
import { useLaunchFlow } from "@/context/launch-flow";
import { ProgressIndicator } from "@/components/progress-indicator";

export function NotificareLaunchBlocker({ children }: PropsWithChildren) {
  const { state, launch } = useLaunchFlow();

  return (
    <>
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
    </>
  );
}
