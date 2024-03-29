"use client";

import { useEffect, useState } from "react";
import { getApplication, NotificareApplication } from "notificare-web/core";
import { Alert } from "@/components/alert";
import { NotificareLaunchBlocker } from "@/components/notificare/notificare-launch-blocker";
import { PageHeader } from "@/components/page-header";

export default function Application() {
  const [application, setApplication] = useState<NotificareApplication>();

  useEffect(() => {
    setApplication(getApplication());
  }, []);

  return (
    <>
      <PageHeader
        title="Notificare application"
        message="Inspect the cached application in your local storage"
      />

      <NotificareLaunchBlocker>
        <div className="md:max-w-2xl flex flex-col gap-4">
          {!application && (
            <Alert variant="warning" message="There is no cached application at the moment." />
          )}

          {application && (
            <pre className="bg-gray-200 dark:bg-neutral-800 text-gray-800 dark:text-gray-200 rounded p-4 overflow-scroll">
              {JSON.stringify(application, null, 2)}
            </pre>
          )}
        </div>
      </NotificareLaunchBlocker>
    </>
  );
}
