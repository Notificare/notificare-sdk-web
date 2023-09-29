"use client";

import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { XCircleIcon } from "@heroicons/react/20/solid";
import { Button } from "@/components/button";
import { useLaunchFlow } from "@/context/launch-flow";
import { isConfigured } from "notificare-web/core";

export function LaunchFlowCard() {
  const { state, launch, unlaunch } = useLaunchFlow();

  return (
    <div className="bg-white rounded-lg shadow dark:bg-slate-900">
      <div className="p-6 border-b border-gray-200">
        <h5 className="text-base font-semibold leading-6 text-gray-900">Launch flow</h5>
      </div>

      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <p className="text-base text-gray-900">Configured</p>

          {isConfigured() && <CheckCircleIcon className="flex-shrink-0 h-6 w-6 text-green-700" />}

          {!isConfigured() && <XCircleIcon className="flex-shrink-0 h-6 w-6 text-red-700" />}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-base text-gray-900">Ready</p>

          {state.tag === "launched" && (
            <CheckCircleIcon className="flex-shrink-0 h-6 w-6 text-green-700" />
          )}

          {state.tag !== "launched" && (
            <XCircleIcon className="flex-shrink-0 h-6 w-6 text-red-700" />
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-base text-gray-900">Current state</p>

          <p className="text-sm font-mono lowercase text-gray-400">{state.tag}</p>
        </div>
      </div>

      <div className="flex flex-row justify-end gap-6 p-6 border-t border-gray-200">
        <Button text="Launch" disabled={state.tag !== "idle"} onClick={launch} />
        <Button text="Unlaunch" disabled={state.tag !== "launched"} onClick={unlaunch} />
      </div>
    </div>
  );
}
