import { Switch } from "@/components/switch";
import { InputField } from "@/components/input-field";
import { ConfigurationFormState } from "@/components/configuration/configuration-form-state";

export function GeneralSettingsCard({ state, onChange }: GeneralSettingsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow dark:bg-slate-900">
      <div className="p-6 border-b border-gray-200">
        <h5 className="text-base font-semibold leading-6 text-gray-900">General settings</h5>
      </div>

      <div className="flex flex-col gap-6 p-6">
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
      </div>
    </div>
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
