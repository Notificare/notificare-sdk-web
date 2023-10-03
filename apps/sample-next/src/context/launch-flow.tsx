"use client";

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { launch, unlaunch } from "notificare-web/core";

type State<T extends string> = { status: T };

export type IdleState = State<"idle">;

export type LaunchingState = State<"launching">;
export type LaunchedState = State<"launched">;
export type LaunchFailedState = State<"launch-failed"> & {
  error: Error;
};

export type UnlaunchingState = State<"unlaunching">;
export type UnlaunchFailedState = State<"unlaunch-failed"> & {
  error: Error;
};

export type LaunchState =
  | IdleState
  | LaunchingState
  | LaunchedState
  | LaunchFailedState
  | UnlaunchingState
  | UnlaunchFailedState;

export interface LaunchFlow {
  state: LaunchState;
  launch: () => void;
  unlaunch: () => void;
}

const LaunchFlowContext = createContext<LaunchFlow | undefined>(undefined);

export function LaunchFlowProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<LaunchState>({ status: "idle" });

  const launchFn = useCallback(() => {
    setState({ status: "launching" });

    launch()
      .then(() => setState({ status: "launched" }))
      .catch((e) => setState({ status: "launch-failed", error: e }));
  }, []);

  const unlaunchFn = useCallback(() => {
    setState({ status: "unlaunching" });

    unlaunch()
      .then(() => setState({ status: "idle" }))
      .catch((e) => setState({ status: "unlaunch-failed", error: e }));
  }, []);

  const launchFlow = useMemo<LaunchFlow>(
    () => ({
      state,
      launch: launchFn,
      unlaunch: unlaunchFn,
    }),
    [state, launchFn, unlaunchFn],
  );

  return <LaunchFlowContext.Provider value={launchFlow}>{children}</LaunchFlowContext.Provider>;
}

export function useLaunchFlow() {
  const launchFlow = useContext(LaunchFlowContext);

  if (!launchFlow) {
    throw new Error("Unable to find the LaunchFlowProvider in the component tree.");
  }

  return launchFlow;
}
