"use client";

import { PageHeader } from "@/components/page-header";
import { NotificareLaunchBlocker } from "@/components/notificare/notificare-launch-blocker";
import { useCallback, useEffect, useState } from "react";
import { getCurrentDevice, NotificareDevice } from "notificare-web/core";
import { useOnDeviceRegistered } from "@/notificare/hooks/events/core/device-registered";
import { Button } from "@/components/button";
import { Alert } from "@/components/alert";

export default function Device() {
  const [device, setDevice] = useState<NotificareDevice>();

  useEffect(() => setDevice(getCurrentDevice()), []);

  useOnDeviceRegistered((device) => setDevice(device));

  const copyToClipboardCallback = useCallback(async () => {
    if (!device) return;

    try {
      await navigator.clipboard.writeText(device.id);
    } catch (e) {
      console.error("Failed to copy the deviceId to the clipboard.");
    }
  }, [device]);

  const copyUrlEncodedToClipboardCallback = useCallback(async () => {
    if (!device) return;

    try {
      await navigator.clipboard.writeText(encodeURIComponent(device.id));
    } catch (e) {
      console.error("Failed to copy the deviceId to the clipboard.");
    }
  }, [device]);

  return (
    <>
      <PageHeader
        title="Registered device"
        message="Inspect the registered device in your local storage"
      />

      <NotificareLaunchBlocker>
        <div className="md:max-w-2xl flex flex-col gap-4">
          {!device && (
            <Alert variant="warning" message="There is no device registered at the moment." />
          )}

          {device && (
            <>
              <div className="flex flex-row gap-4">
                <Button text="Copy deviceId" onClick={copyToClipboardCallback} />

                <Button
                  text="Copy URL-encoded deviceId"
                  onClick={copyUrlEncodedToClipboardCallback}
                />
              </div>

              <pre className="bg-gray-200 rounded p-4 overflow-scroll">
                {JSON.stringify(device, null, 2)}
              </pre>
            </>
          )}
        </div>
      </NotificareLaunchBlocker>
    </>
  );
}
