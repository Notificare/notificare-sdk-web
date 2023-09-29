"use client";

import { PageHeader, PageHeaderAction } from "@/components/page-header";
import { EnvelopeOpenIcon, TrashIcon } from "@heroicons/react/24/solid";
import { Alert } from "@/components/alert";
import { useLaunchFlow } from "@/context/launch-flow";
import spinnerIcon from "@/../public/assets/circular-spinner.svg";
import Image from "next/image";

export default function Inbox() {
  const { state } = useLaunchFlow();

  return (
    <>
      <PageHeader
        title="Inbox"
        message="Easily manage your messages, conversations, and notifications in one centralized hub."
        actions={
          <>
            <PageHeaderAction label="Mark all as read" icon={EnvelopeOpenIcon} onClick={() => {}} />
            <PageHeaderAction label="Remove all" icon={TrashIcon} onClick={() => {}} />
          </>
        }
      />

      <div className="flex flex-col gap-8">
        <Alert
          message="This application is not configured."
          action={{ label: "Configure", url: "/setup" }}
        />

        <Alert
          variant="warning"
          message="This application is not configured."
          action={{ label: "Configure", url: "/setup" }}
        />

        <Alert
          variant="error"
          message="This application is not configured."
          action={{ label: "Configure", url: "/setup" }}
        />

        <div>
          <h3 className="flex items-center text-lg font-semibold leading-7 text-gray-900 sm:truncate sm:text-xl sm:tracking-tight dark:text-white">
            Launch flow in progress
            <Image src={spinnerIcon} alt="" className="animate-spin ml-3 h-5 w-5" />
          </h3>

          <span className="mt-1 sm:mt-0 text-sm text-gray-500 dark:text-gray-300">
            Wait a moment while Notificare finishes launching.
          </span>
        </div>
      </div>
    </>
  );
}
