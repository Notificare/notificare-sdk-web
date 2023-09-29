"use client";

import { useEffect } from "react";
import { useLaunchFlow } from "@/context/launch-flow";

export function AutoLauncher() {
  const { launch } = useLaunchFlow();

  useEffect(() => launch(), [launch]);

  return null;
}
