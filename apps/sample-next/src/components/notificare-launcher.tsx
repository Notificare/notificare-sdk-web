"use client";

import { useNotificare } from "@/hooks/use-notificare";

// Using the managed onboarding & floating button requires the module
// to be imported even though we're not accessing anything from it explicitly.
import "@notificare/push";

export function NotificareLauncher() {
  useNotificare();

  return <></>;
}
