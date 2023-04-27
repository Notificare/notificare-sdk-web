"use client";

import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { isReady, launch, onReady } from "@notificare/core";
import { setLogLevel } from "@notificare/logger";
import { onNotificationOpened } from "@notificare/push";
import { presentNotification } from "@notificare/push-ui";

export type NotificareState = "idle" | "launched" | "failed";

const NotificareContext = createContext<NotificareState>("idle");

export function NotificareProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<NotificareState>("idle");

  useEffect(function enableDebugLogging() {
    setLogLevel("debug");
  }, []);

  useEffect(function setupListeners() {
    const subscriptions = [
      onReady(() => {
        setState("launched");
      }),
      // TODO: on unlaunched,
      onNotificationOpened((notification) => {
        presentNotification(notification);
      }),
    ];

    return () => subscriptions.forEach((sub) => sub.remove());
  }, []);

  useEffect(function launchNotificare() {
    if (isReady()) {
      setState("launched");
      return;
    }

    launch()
      .then(() => console.log("Notificare launched."))
      .catch((e) => {
        console.error(`Failed to launch Notificare: ${e}`);
        setState("failed");
      });
  }, []);

  return (
    <NotificareContext.Provider value={state}>
      {children}
    </NotificareContext.Provider>
  );
}

export function useNotificare() {
  return useContext(NotificareContext);
}
