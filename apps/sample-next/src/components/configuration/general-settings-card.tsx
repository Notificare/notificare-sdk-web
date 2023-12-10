import { Card, CardContent, CardHeader } from "@/components/card";
import { ConfigurationFormState } from "@/components/configuration/configuration-form-state";
import { InputField } from "@/components/input-field";
import { Switch } from "@/components/switch";

export function GeneralSettingsCard({ state, onChange }: GeneralSettingsCardProps) {
  return (
    <Card>
      <CardHeader title="General settings" />

      <CardContent>
        <Switch
          label="Debug logging enabled"
          description="Enable this setting to print additional log messages."
          disabled={!onChange}
          checked={state.debugLoggingEnabled}
          onChange={(checked) => {
            onChange?.({
              ...state,
              debugLoggingEnabled: checked,
            });
          }}
        />

        <InputField
          id="application-version"
          label="Application version"
          placeholder="1.0.0"
          disabled={!onChange}
          value={state.applicationVersion}
          onChange={(e) => {
            onChange?.({
              ...state,
              applicationVersion: e.target.value,
            });
          }}
        />

        <InputField
          id="language"
          label="Language"
          placeholder="nl"
          disabled={!onChange}
          value={state.language}
          onChange={(e) => {
            onChange?.({
              ...state,
              language: e.target.value,
            });
          }}
        />

        <Switch
          label="Ignore temporary devices"
          description="Prevent the registration of temporary devices."
          disabled={!onChange}
          checked={state.ignoreTemporaryDevices}
          onChange={(checked) => {
            onChange?.({
              ...state,
              ignoreTemporaryDevices: checked,
            });
          }}
        />

        <Switch
          label="Ignore unsupported WebPush devices"
          description="Prevent the registration of temporary devices that are not capable of receiving remote notifications."
          disabled={!onChange}
          checked={state.ignoreUnsupportedWebPushDevices}
          onChange={(checked) => {
            onChange?.({
              ...state,
              ignoreUnsupportedWebPushDevices: checked,
            });
          }}
        />
      </CardContent>
    </Card>
  );
}

interface GeneralSettingsCardProps {
  state: GeneralSettingsFormState;
  onChange?: GeneralSettingsOnChange;
}

type GeneralSettingsFormState = Pick<
  ConfigurationFormState,
  | "debugLoggingEnabled"
  | "applicationVersion"
  | "language"
  | "ignoreTemporaryDevices"
  | "ignoreUnsupportedWebPushDevices"
>;

type GeneralSettingsOnChange = (state: GeneralSettingsFormState) => void;
