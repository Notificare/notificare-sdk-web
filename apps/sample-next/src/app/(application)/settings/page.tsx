"use client";

import { useEffect, useState } from "react";
import { NotificareOptions } from "notificare-web/core";
import { ConfigurationForm } from "@/components/configuration/configuration-form";
import { ConfigurationFormState } from "@/components/configuration/configuration-form-state";
import { NotificareLaunchBlocker } from "@/components/notificare/notificare-launch-blocker";
import { PageHeader } from "@/components/page-header";

export default function Settings() {
  const [state, setState] = useState<ConfigurationFormState>();

  useEffect(function loadConfiguration() {
    const encodedConfig = localStorage.getItem("app_configuration");
    if (!encodedConfig) return;

    const config = JSON.parse(encodedConfig);
    const { debugLoggingEnabled, ...rest } = config;
    const options: NotificareOptions = rest;

    setState({
      debugLoggingEnabled,
      applicationVersion: options.applicationVersion ?? "",
      language: options.language ?? "",
      ignoreTemporaryDevices: options.ignoreTemporaryDevices ?? false,
      ignoreUnsupportedWebPushDevices: options.ignoreUnsupportedWebPushDevices ?? false,
      serviceWorkerLocation: options.serviceWorker ?? "",
      serviceWorkerScope: options.serviceWorkerScope ?? "",
      geolocationHighAccuracyEnabled: options.geolocation?.enableHighAccuracy ?? false,
      geolocationMaximumAge: options.geolocation?.maximumAge?.toString() ?? "",
      geolocationTimeout: options.geolocation?.timeout?.toString() ?? "",
    });
  }, []);

  return (
    <>
      <PageHeader
        title="Settings"
        message="Review the options you configured for your environment."
      />

      <NotificareLaunchBlocker>
        {state && <ConfigurationForm state={state} />}
      </NotificareLaunchBlocker>
    </>
  );
}
