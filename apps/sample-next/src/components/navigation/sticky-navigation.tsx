"use client";

import { Bars3Icon } from "@heroicons/react/24/outline";
import { useNavigation } from "@/context/navigation";
import { InboxBell } from "@/components/navigation/inbox-bell";
import { useEffect, useState } from "react";
import { getCurrentDevice, NotificareDevice } from "notificare-web/core";
import { Gravatar } from "@/components/gravatar";
import { useOnDeviceRegistered } from "@/notificare/hooks/events/core/device-registered";

export function StickyNavigation() {
  const { sidebar } = useNavigation();
  const [device, setDevice] = useState<NotificareDevice>();

  useEffect(() => setDevice(getCurrentDevice()), []);
  useOnDeviceRegistered((device) => setDevice(device));

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        onClick={() => sidebar.setOpen(!sidebar.isOpen)}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 flex-row-reverse gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <InboxBell />

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

          <div className="-m-1.5 flex items-center p-1.5">
            <Gravatar email={device?.userId ?? ""} />
            <span className="hidden lg:flex lg:items-center">
              <span
                className="ml-4 text-sm font-semibold leading-6 text-gray-900"
                aria-hidden="true"
              >
                {device?.userName ?? "Anonymous"}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

type UserInformation = {
  email: string;
  name: string;
};
