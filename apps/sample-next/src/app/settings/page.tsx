"use client";

import { useNotificare } from "@/context/notificare";
import {
  enableRemoteNotifications,
  disableRemoteNotifications,
} from "notificare-web/push";

export default function Settings() {
  const notificareState = useNotificare();

  return (
    <>
      {notificareState !== "launched" ? (
        <p>stuff is not ready</p>
      ) : (
        <>
          <div className="space-x-4">
            <button
              type="button"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => enableRemoteNotifications()}
            >
              Enable remote notifications
            </button>

            <button
              type="button"
              className="rounded-md px-3.5 py-2.5 text-sm font-semibold text-indigo-600 hover:shadow-sm hover:bg-indigo-100"
              onClick={() => disableRemoteNotifications()}
            >
              Disable remote notifications
            </button>
          </div>
        </>
      )}
    </>
  );
}
