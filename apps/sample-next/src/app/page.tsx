"use client";

import { Inter } from "next/font/google";
import { useNotificare } from "@/context/notificare";
import { useCallback } from "react";
import { launch, unlaunch } from "notificare/core";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const state = useNotificare();

  const onLaunchClick = useCallback(() => {
    launch()
      .then(() => console.log("Launched successfully."))
      .catch((e) => console.error("Failed to launch.", e));
  }, []);

  const onUnlaunchClick = useCallback(() => {
    unlaunch()
      .then(() => console.log("Un-launched successfully."))
      .catch((e) => console.error("Failed to launch.", e));
  }, []);

  return (
    <>
      <p className="text-lg font-medium text-gray-900 truncate dark:text-white">
        notificare = {state}
      </p>

      <div className="mt-6 space-x-4">
        <button
          type="button"
          className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={onLaunchClick}
        >
          Launch
        </button>

        <button
          type="button"
          className="rounded-md px-3.5 py-2.5 text-sm font-semibold text-indigo-600 hover:shadow-sm hover:bg-indigo-100"
          onClick={onUnlaunchClick}
        >
          Unlaunch
        </button>
      </div>
    </>
  );
}
