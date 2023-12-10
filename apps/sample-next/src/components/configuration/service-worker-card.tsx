import { Card, CardContent, CardHeader } from "@/components/card";
import { ConfigurationFormState } from "@/components/configuration/configuration-form-state";
import { InputField } from "@/components/input-field";

export function ServiceWorkerSettingsCard({ state, onChange }: ServiceWorkerSettingsCardProps) {
  return (
    <Card>
      <CardHeader title="Service worker settings" />

      <CardContent>
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
      </CardContent>
    </Card>
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
