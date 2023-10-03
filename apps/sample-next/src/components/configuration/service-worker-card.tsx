import { InputField } from "@/components/input-field";
import { ConfigurationFormState } from "@/components/configuration/configuration-form-state";

export function ServiceWorkerSettingsCard({ state, onChange }: ServiceWorkerSettingsCardProps) {
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
          disabled={!onChange}
          value={state.serviceWorkerLocation}
          onChange={(e) => {
            onChange?.({
              ...state,
              serviceWorkerLocation: e.target.value,
            });
          }}
        />

        <InputField
          id="service-worker-scope"
          label="Service worker scope"
          disabled={!onChange}
          value={state.serviceWorkerScope}
          onChange={(e) => {
            onChange?.({
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
  onChange?: ServiceWorkerSettingsOnChange;
}

type ServiceWorkerSettingsFormState = Pick<
  ConfigurationFormState,
  "serviceWorkerLocation" | "serviceWorkerScope"
>;

type ServiceWorkerSettingsOnChange = (state: ServiceWorkerSettingsFormState) => void;
