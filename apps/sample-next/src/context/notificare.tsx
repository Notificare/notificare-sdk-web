"use client";

import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  setLogLevel,
  isReady,
  launch,
  onReady,
  onUnlaunched,
} from "notificare/core";
import { onNotificationOpened } from "notificare/push";
import {
  onActionExecuted,
  onActionFailedToExecute,
  onActionWillExecute,
  onCustomActionReceived,
  onNotificationFailedToPresent,
  onNotificationFinishedPresenting,
  onNotificationPresented,
  onNotificationWillPresent,
  presentNotification,
} from "notificare/push-ui";

import "notificare/core";
import "notificare/assets";
import "notificare/geo";
import "notificare/inbox";
import "notificare/in-app-messaging";
import "notificare/push";
import "notificare/push-ui";

export type NotificareState = "idle" | "launched" | "failed";

const NotificareContext = createContext<NotificareState>("idle");

export function NotificareProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<NotificareState>("idle");

  useEffect(function enableDebugLogging() {
    setLogLevel("debug");
  }, []);

  useEffect(function setupListeners() {
    const subscriptions = [
      onReady(() => setState("launched")),
      onUnlaunched(() => setState("idle")),
      onNotificationOpened((notification) => {
        presentNotification(notification);
      }),
      onNotificationWillPresent((notification) => {
        console.log(`notification ${notification.id} will present`);
      }),
      onNotificationPresented((notification) => {
        console.log(`notification ${notification.id} presented`);
      }),
      onNotificationFinishedPresenting((notification) => {
        console.log(`notification ${notification.id} finished presenting`);
      }),
      onNotificationFailedToPresent((notification) => {
        console.log(`notification ${notification.id} failed to present`);
      }),
      onActionWillExecute((notification, action) => {
        console.log(
          `notification ${notification.id} / action '${action.label}' will execute`
        );
      }),
      onActionExecuted((notification, action) => {
        console.log(
          `notification ${notification.id} / action '${action.label}' executed`
        );
      }),
      onActionFailedToExecute((notification, action) => {
        console.log(
          `notification ${notification.id} / action '${action.label}' failed to execute`
        );
      }),
      onCustomActionReceived((notification, action, target) => {
        console.log(
          `notification ${notification.id} / action '${action.label}' custom action received`
        );

        window.location.href = target;
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
