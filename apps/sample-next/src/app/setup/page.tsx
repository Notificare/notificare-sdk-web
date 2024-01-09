"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { NotificareOptions } from "notificare-web/core";
import { ConfigurationForm } from "@/components/configuration/configuration-form";
import { ConfigurationFormState } from "@/components/configuration/configuration-form-state";
import { PageHeader, PageHeaderAction } from "@/components/page-header";

export default function Setup() {
  const [state, setState] = useState<ConfigurationFormState>({
    debugLoggingEnabled: true,
    applicationVersion: "",
    language: "",
    ignoreTemporaryDevices: false,
    ignoreUnsupportedWebPushDevices: false,
    serviceWorkerLocation: "",
    serviceWorkerScope: "",
    geolocationHighAccuracyEnabled: false,
    geolocationMaximumAge: "",
    geolocationTimeout: "",
  });

  const setup = useCallback(async () => {
    try {
      const response = await fetch("/notificare-services.json");
      let config: NotificareOptions = await response.json();

      config.applicationVersion = state.applicationVersion.trim() || undefined;
      config.language = state.language.trim() || undefined;
      config.ignoreTemporaryDevices = state.ignoreTemporaryDevices;
      config.ignoreUnsupportedWebPushDevices = state.ignoreUnsupportedWebPushDevices;

      config.serviceWorker = state.serviceWorkerLocation.trim() || undefined;
      config.serviceWorkerScope = state.serviceWorkerScope.trim() || undefined;

      config.geolocation = {
        enableHighAccuracy: state.geolocationHighAccuracyEnabled,
      };

      const maximumAge = parseInt(state.geolocationMaximumAge.trim());
      if (!isNaN(maximumAge)) config.geolocation.maximumAge = maximumAge;

      const timeout = parseInt(state.geolocationTimeout);
      if (!isNaN(timeout)) config.geolocation.timeout = timeout;

      localStorage.setItem(
        "app_configuration",
        JSON.stringify({
          debugLoggingEnabled: state.debugLoggingEnabled,
          ...config,
        }),
      );
      window.location.href = "/";
    } catch (e) {
      console.log(`Something went wrong: ${e}`);
    }
  }, [state]);

  useEffect(function ensureCleanState() {
    const config = localStorage.getItem("app_configuration");
    if (config) window.location.href = "/";
  }, []);

  return (
    <main className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Setup your environment"
          message="These options will be persisted across restart unless you remove them from local storage."
          actions={
            <>
              <PageHeaderAction label="Continue" icon={CheckIcon} onClick={setup} />
            </>
          }
        />

        <ConfigurationForm state={state} onChange={setState} />
      </div>
    </main>
  );
}
