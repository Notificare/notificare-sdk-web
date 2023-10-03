"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader, PageHeaderAction } from "@/components/page-header";
import { CheckIcon } from "@heroicons/react/20/solid";
import { Switch } from "@/components/switch";
import { InputField } from "@/components/input-field";
import { setLogLevel, NotificareOptions } from "notificare-web/core";

export default function Setup() {
  const [state, setState] = useState<SetupFormState>({
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

        <div className="grid grid-flow-row grid-cols-1 md:grid-cols-2 gap-8">
          <GeneralSettingsCard
            state={state}
            onChange={(value) => {
              setState((prevState) => ({
                ...prevState,
                ...value,
              }));
            }}
          />

          <ServiceWorkerSettingsCard
            state={state}
            onChange={(value) => {
              setState((prevState) => ({
                ...prevState,
                ...value,
              }));
            }}
          />

          <GeolocationSettingsCard
            state={state}
            onChange={(value) => {
              setState((prevState) => ({
                ...prevState,
                ...value,
              }));
            }}
          />
        </div>
      </div>
    </main>
  );
}

interface SetupFormState {
  debugLoggingEnabled: boolean;
  applicationVersion: string;
  language: string;
  ignoreTemporaryDevices: boolean;
  ignoreUnsupportedWebPushDevices: boolean;
  serviceWorkerLocation: string;
  serviceWorkerScope: string;
  geolocationHighAccuracyEnabled: boolean;
  geolocationMaximumAge: string;
  geolocationTimeout: string;
}

function GeneralSettingsCard({ state, onChange }: GeneralSettingsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow dark:bg-slate-900">
      <div className="p-6 border-b border-gray-200">
        <h5 className="text-base font-semibold leading-6 text-gray-900">General settings</h5>
      </div>

      <div className="flex flex-col gap-6 p-6">
        <Switch
          label="Debug logging enabled"
          description="Enable this setting to print additional log messages."
          checked={state.debugLoggingEnabled}
          onChange={(checked) => {
            onChange({
              ...state,
              debugLoggingEnabled: checked,
            });
          }}
        />

        <InputField
          id="application-version"
          label="Application version"
          placeholder="1.0.0"
          value={state.applicationVersion}
          onChange={(e) => {
            onChange({
              ...state,
              applicationVersion: e.target.value,
            });
          }}
        />

        <InputField
          id="language"
          label="Language"
          placeholder="nl"
          value={state.language}
          onChange={(e) => {
            onChange({
              ...state,
              language: e.target.value,
            });
          }}
        />

        <Switch
          label="Ignore temporary devices"
          description="Prevent the registration of temporary devices."
          checked={state.ignoreTemporaryDevices}
          onChange={(checked) => {
            onChange({
              ...state,
              ignoreTemporaryDevices: checked,
            });
          }}
        />

        <Switch
          label="Ignore unsupported WebPush devices"
          description="Prevent the registration of temporary devices that are not capable of receiving remote notifications."
          checked={state.ignoreUnsupportedWebPushDevices}
          onChange={(checked) => {
            onChange({
              ...state,
              ignoreUnsupportedWebPushDevices: checked,
            });
          }}
        />
      </div>
    </div>
  );
}

interface GeneralSettingsCardProps {
  state: GeneralSettingsFormState;
  onChange: GeneralSettingsOnChange;
}

type GeneralSettingsFormState = Pick<
  SetupFormState,
  | "debugLoggingEnabled"
  | "applicationVersion"
  | "language"
  | "ignoreTemporaryDevices"
  | "ignoreUnsupportedWebPushDevices"
>;

type GeneralSettingsOnChange = (state: GeneralSettingsFormState) => void;

function ServiceWorkerSettingsCard({ state, onChange }: ServiceWorkerSettingsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow dark:bg-slate-900">
      <div className="p-6 border-b border-gray-200">
        <h5 className="text-base font-semibold leading-6 text-gray-900">Service worker settings</h5>
      </div>

      <div className="flex flex-col gap-6 p-6">
        <InputField
          id="service-worker-location"
          label="Service worker location"
          placeholder="/sw.js"
          value={state.serviceWorkerLocation}
          onChange={(e) => {
            onChange({
              ...state,
              serviceWorkerLocation: e.target.value,
            });
          }}
        />

        <InputField
          id="service-worker-scope"
          label="Service worker scope"
          value={state.serviceWorkerScope}
          onChange={(e) => {
            onChange({
              ...state,
              serviceWorkerScope: e.target.value,
            });
          }}
        />
      </div>
    </div>
  );
}

interface ServiceWorkerSettingsCardProps {
  state: ServiceWorkerSettingsFormState;
  onChange: ServiceWorkerSettingsOnChange;
}

type ServiceWorkerSettingsFormState = Pick<
  SetupFormState,
  "serviceWorkerLocation" | "serviceWorkerScope"
>;

type ServiceWorkerSettingsOnChange = (state: ServiceWorkerSettingsFormState) => void;

function GeolocationSettingsCard({ state, onChange }: GeolocationSettingsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow dark:bg-slate-900">
      <div className="p-6 border-b border-gray-200">
        <h5 className="text-base font-semibold leading-6 text-gray-900">Geolocation settings</h5>
      </div>

      <div className="flex flex-col gap-6 p-6">
        <Switch
          label="Enable high accuracy"
          description="The device will provide the best possible results when available."
          checked={state.geolocationHighAccuracyEnabled}
          onChange={(checked) => {
            onChange({
              ...state,
              geolocationHighAccuracyEnabled: checked,
            });
          }}
        />

        <InputField
          type="number"
          id="geolocation-maximum-age"
          label="Maximum age (milliseconds)"
          value={state.geolocationMaximumAge}
          onChange={(e) => {
            onChange({
              ...state,
              geolocationMaximumAge: e.target.value,
            });
          }}
        />

        <InputField
          type="number"
          id="geolocation-timeout"
          label="Timeout (milliseconds)"
          value={state.geolocationTimeout}
          onChange={(e) => {
            onChange({
              ...state,
              geolocationTimeout: e.target.value,
            });
          }}
        />
      </div>
    </div>
  );
}

interface GeolocationSettingsCardProps {
  state: GeolocationSettingsFormState;
  onChange: GeolocationSettingsOnChange;
}

type GeolocationSettingsFormState = Pick<
  SetupFormState,
  "geolocationHighAccuracyEnabled" | "geolocationMaximumAge" | "geolocationTimeout"
>;

type GeolocationSettingsOnChange = (state: GeolocationSettingsFormState) => void;
