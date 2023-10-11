"use client";

import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { XCircleIcon } from "@heroicons/react/20/solid";
import { Button } from "@/components/button";
import { useLaunchFlow } from "@/context/launch-flow";
import { isConfigured } from "notificare-web/core";
import { Card, CardActions, CardContent, CardHeader } from "@/components/card";

export function LaunchFlowCard() {
  const { state, launch, unlaunch } = useLaunchFlow();

  return (
    <Card>
      <CardHeader title="Launch flow" />

      <CardContent>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium leading-6 text-gray-900">Configured</p>

          {isConfigured() && <CheckCircleIcon className="flex-shrink-0 h-6 w-6 text-green-700" />}

          {!isConfigured() && <XCircleIcon className="flex-shrink-0 h-6 w-6 text-red-700" />}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm font-medium leading-6 text-gray-900">Ready</p>

          {state.status === "launched" && (
            <CheckCircleIcon className="flex-shrink-0 h-6 w-6 text-green-700" />
          )}

          {state.status !== "launched" && (
            <XCircleIcon className="flex-shrink-0 h-6 w-6 text-red-700" />
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm font-medium leading-6 text-gray-900">Current state</p>

          <p className="text-sm font-mono lowercase text-gray-400">{state.status}</p>
        </div>
      </CardContent>

      <CardActions>
        <Button text="Launch" disabled={state.status !== "idle"} onClick={launch} />
        <Button text="Unlaunch" disabled={state.status !== "launched"} onClick={unlaunch} />
      </CardActions>
    </Card>
  );
}
