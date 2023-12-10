"use client";

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { launch, onDeviceRegistered, onReady, onUnlaunched, unlaunch } from "notificare-web/core";
import { onLocationUpdated, onLocationUpdateError } from "notificare-web/geo";
import {
  onActionExecuted as onMessageActionExecuted,
  onActionFailedToExecute as onMessageActionFailedToExecute,
  onMessageFailedToPresent,
  onMessageFinishedPresenting,
  onMessagePresented,
} from "notificare-web/in-app-messaging";
import { onBadgeUpdated, onInboxUpdated } from "notificare-web/inbox";
import {
  onNotificationActionOpened,
  onNotificationOpened,
  onNotificationReceived,
  onSystemNotificationReceived,
  onUnknownNotificationReceived,
} from "notificare-web/push";
import {
  onNotificationWillPresent,
  onNotificationPresented,
  onNotificationFinishedPresenting,
  onNotificationFailedToPresent,
  onActionWillExecute as onNotificationActionWillExecute,
  onActionExecuted as onNotificationActionExecuted,
  onActionFailedToExecute as onNotificationActionFailedToExecute,
  onCustomActionReceived as onNotificationCustomActionReceived,
} from "notificare-web/push-ui";
import {
  createListenerIdentifier,
  IdentifiableListener,
  Listener,
} from "@/notificare/hooks/events/base";

const NotificareContext = createContext<NotificareContextState | undefined>(undefined);

export function useNotificare() {
  const context = useContext(NotificareContext);

  if (!context) {
    throw new Error("Unable to find the NotificareProvider in the component tree.");
  }

  return context;
}

export function NotificareProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<LaunchState>({ status: "idle" });
  const [listeners, setListeners] = useState<IdentifiableListener[]>([]);

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

  const registerListener = useCallback<RegisterListenerFn>((listener) => {
    const identifier = createListenerIdentifier();

    setListeners((prevState) => [
      ...prevState,
      {
        ...listener,
        identifier,
      },
    ]);

    return () => {
      setListeners((prevState) =>
        prevState.filter((listener) => listener.identifier !== identifier),
      );
    };
  }, []);

  useEffect(() => {
    const subscriptions = [
      /**
       * Core events
       */
      onReady((application) => {
        listeners.forEach((listener) => {
          if (listener.event === "ready") {
            listener.callback(application);
          }
        });
      }),
      onUnlaunched(() => {
        listeners.forEach((listener) => {
          if (listener.event === "unlaunched") {
            listener.callback();
          }
        });
      }),
      onDeviceRegistered((device) => {
        listeners.forEach((listener) => {
          if (listener.event === "device_registered") {
            listener.callback(device);
          }
        });
      }),
      /**
       * Geo
       */
      onLocationUpdated((location) => {
        listeners.forEach((listener) => {
          if (listener.event === "location_updated") {
            listener.callback(location);
          }
        });
      }),
      onLocationUpdateError((error) => {
        listeners.forEach((listener) => {
          if (listener.event === "location_update_error") {
            listener.callback(error);
          }
        });
      }),
      /**
       * In-app messaging events
       */
      onMessagePresented((message) => {
        listeners.forEach((listener) => {
          if (listener.event === "message_presented") {
            listener.callback(message);
          }
        });
      }),
      onMessageFinishedPresenting((message) => {
        listeners.forEach((listener) => {
          if (listener.event === "message_finished_presenting") {
            listener.callback(message);
          }
        });
      }),
      onMessageFailedToPresent((message) => {
        listeners.forEach((listener) => {
          if (listener.event === "message_failed_to_present") {
            listener.callback(message);
          }
        });
      }),
      onMessageActionExecuted((message, action) => {
        listeners.forEach((listener) => {
          if (listener.event === "message_action_executed") {
            listener.callback(message, action);
          }
        });
      }),
      onMessageActionFailedToExecute((message, action) => {
        listeners.forEach((listener) => {
          if (listener.event === "message_action_failed_to_execute") {
            listener.callback(message, action);
          }
        });
      }),
      /**
       * Inbox events
       */
      onInboxUpdated(() => {
        listeners.forEach((listener) => {
          if (listener.event === "inbox_updated") {
            listener.callback();
          }
        });
      }),
      onBadgeUpdated((badge) => {
        listeners.forEach((listener) => {
          if (listener.event === "badge_updated") {
            listener.callback(badge);
          }
        });
      }),
      /**
       * Push events
       */
      onNotificationReceived((notification, deliveryMechanism) => {
        listeners.forEach((listener) => {
          if (listener.event === "notification_received") {
            listener.callback(notification, deliveryMechanism);
          }
        });
      }),
      onSystemNotificationReceived((notification) => {
        listeners.forEach((listener) => {
          if (listener.event === "system_notification_received") {
            listener.callback(notification);
          }
        });
      }),
      onUnknownNotificationReceived((notification) => {
        listeners.forEach((listener) => {
          if (listener.event === "unknown_notification_received") {
            listener.callback(notification);
          }
        });
      }),
      onNotificationOpened((notification) => {
        listeners.forEach((listener) => {
          if (listener.event === "notification_opened") {
            listener.callback(notification);
          }
        });
      }),
      onNotificationActionOpened((notification, action) => {
        listeners.forEach((listener) => {
          if (listener.event === "notification_action_opened") {
            listener.callback(notification, action);
          }
        });
      }),
      /**
       * Push UI events
       */
      onNotificationWillPresent((notification) => {
        listeners.forEach((listener) => {
          if (listener.event === "notification_will_present") {
            listener.callback(notification);
          }
        });
      }),
      onNotificationPresented((notification) => {
        listeners.forEach((listener) => {
          if (listener.event === "notification_presented") {
            listener.callback(notification);
          }
        });
      }),
      onNotificationFinishedPresenting((notification) => {
        listeners.forEach((listener) => {
          if (listener.event === "notification_finished_presenting") {
            listener.callback(notification);
          }
        });
      }),
      onNotificationFailedToPresent((notification) => {
        listeners.forEach((listener) => {
          if (listener.event === "notification_failed_to_present") {
            listener.callback(notification);
          }
        });
      }),
      onNotificationActionWillExecute((notification, action) => {
        listeners.forEach((listener) => {
          if (listener.event === "notification_action_will_execute") {
            listener.callback(notification, action);
          }
        });
      }),
      onNotificationActionExecuted((notification, action) => {
        listeners.forEach((listener) => {
          if (listener.event === "notification_action_executed") {
            listener.callback(notification, action);
          }
        });
      }),
      onNotificationActionFailedToExecute((notification, action) => {
        listeners.forEach((listener) => {
          if (listener.event === "notification_action_failed_to_execute") {
            listener.callback(notification, action);
          }
        });
      }),
      onNotificationCustomActionReceived((notification, action, target) => {
        listeners.forEach((listener) => {
          if (listener.event === "notification_custom_action_received") {
            listener.callback(notification, action, target);
          }
        });
      }),
    ];

    return () => subscriptions.forEach((sub) => sub.remove());
  }, [listeners]);

  const contextState = useMemo<NotificareContextState>(
    () => ({
      state,
      launch: launchFn,
      unlaunch: unlaunchFn,
      registerListener,
    }),
    [state, launchFn, unlaunchFn, registerListener],
  );

  return <NotificareContext.Provider value={contextState}>{children}</NotificareContext.Provider>;
}

type NotificareContextState = {
  state: LaunchState;
  launch: LaunchFn;
  unlaunch: UnlaunchFn;
  registerListener: RegisterListenerFn;
};

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

type LaunchFn = () => void;
type UnlaunchFn = () => void;

type RegisterListenerFn = (listener: Listener) => UnregisterListenerFn;

type UnregisterListenerFn = () => void;
