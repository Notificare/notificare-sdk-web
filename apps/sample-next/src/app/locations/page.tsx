"use client";

import { useNotificare } from "@/context/notificare";
import {
  disableLocationUpdates,
  enableLocationUpdates,
} from "notificare-web/geo";

export default function Locations() {
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
              onClick={() => enableLocationUpdates()}
            >
              Enable location updates
            </button>

            <button
              type="button"
              className="rounded-md px-3.5 py-2.5 text-sm font-semibold text-indigo-600 hover:shadow-sm hover:bg-indigo-100"
              onClick={() => disableLocationUpdates()}
            >
              Disable location updates
            </button>
          </div>
        </>
      )}
    </>
  );
}
