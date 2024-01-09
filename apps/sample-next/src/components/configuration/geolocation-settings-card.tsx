import { Card, CardContent, CardHeader } from "@/components/card";
import { ConfigurationFormState } from "@/components/configuration/configuration-form-state";
import { InputField } from "@/components/input-field";
import { Switch } from "@/components/switch";

export function GeolocationSettingsCard({ state, onChange }: GeolocationSettingsCardProps) {
  return (
    <Card>
      <CardHeader title="Geolocation settings" />

      <CardContent>
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
      </CardContent>
    </Card>
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
