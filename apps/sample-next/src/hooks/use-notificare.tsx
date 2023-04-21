import { useEffect, useState } from "react";
import { setLogLevel } from "@notificare/logger";
import { isReady, launch, onReady } from "@notificare/core";

export function useNotificare() {
  const [state, setState] = useState<ReadinessState>("pending");

  useEffect(() => {
    setLogLevel("debug");

    const subscriptions = [
      onReady(() => {
        setState("ready");
      }),
      // TODO: onUnlaunched
    ];

    if (isReady()) {
      setState("ready");
    } else {
      launch().catch(() => setState("failed"));
    }

    return () => subscriptions.forEach((sub) => sub.remove());
  }, []);

  return {
    state: state,
  };
}

export type ReadinessState = "pending" | "ready" | "failed";
