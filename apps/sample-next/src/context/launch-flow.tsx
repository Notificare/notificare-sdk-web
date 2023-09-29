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

type TaggedState<T extends string> = { tag: T };

export type IdleState = TaggedState<"idle">;

export type LaunchingState = TaggedState<"launching">;
export type LaunchedState = TaggedState<"launched">;
export type LaunchFailedState = TaggedState<"launch-failed"> & {
  error: Error;
};

export type UnlaunchingState = TaggedState<"unlaunching">;
export type UnlaunchFailedState = TaggedState<"unlaunch-failed"> & {
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
  const [state, setState] = useState<LaunchState>({ tag: "idle" });

  const launchFn = useCallback(() => {
    setState({ tag: "launching" });

    launch()
      .then(() => setState({ tag: "launched" }))
      .catch((e) => setState({ tag: "launch-failed", error: e }));
  }, []);

  const unlaunchFn = useCallback(() => {
    setState({ tag: "unlaunching" });

    unlaunch()
      .then(() => setState({ tag: "idle" }))
      .catch((e) => setState({ tag: "unlaunch-failed", error: e }));
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
