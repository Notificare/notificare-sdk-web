import { Switch } from "@/components/switch";
import { InputField } from "@/components/input-field";
import { ConfigurationFormState } from "@/components/configuration/configuration-form-state";

export function GeolocationSettingsCard({ state, onChange }: GeolocationSettingsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow dark:bg-slate-900">
      <div className="p-6 border-b border-gray-200">
        <h5 className="text-base font-semibold leading-6 text-gray-900">Geolocation settings</h5>
      </div>

      <div className="flex flex-col gap-6 p-6">
        <Switch
          label="Enable high accuracy"
          description="The device will provide the best possible results when available."
          disabled={!onChange}
          checked={state.geolocationHighAccuracyEnabled}
          onChange={(checked) => {
            onChange?.({
              ...state,
              geolocationHighAccuracyEnabled: checked,
            });
          }}
        />

        <InputField
          type="number"
          id="geolocation-maximum-age"
          label="Maximum age (milliseconds)"
          disabled={!onChange}
          value={state.geolocationMaximumAge}
          onChange={(e) => {
            onChange?.({
              ...state,
              geolocationMaximumAge: e.target.value,
            });
          }}
        />

        <InputField
          type="number"
          id="geolocation-timeout"
          label="Timeout (milliseconds)"
          disabled={!onChange}
          value={state.geolocationTimeout}
          onChange={(e) => {
            onChange?.({
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
  onChange?: GeolocationSettingsOnChange;
}

type GeolocationSettingsFormState = Pick<
  ConfigurationFormState,
  "geolocationHighAccuracyEnabled" | "geolocationMaximumAge" | "geolocationTimeout"
>;

type GeolocationSettingsOnChange = (state: GeolocationSettingsFormState) => void;
