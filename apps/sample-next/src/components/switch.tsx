import { Switch as HeadlessSwitch } from "@headlessui/react";
import cx from "classnames";

export function Switch({ label, description, disabled = false, checked, onChange }: SwitchProps) {
  return (
    <HeadlessSwitch.Group as="div" className="flex items-center justify-between">
      {label && (
        <span className="flex flex-grow flex-col">
          <HeadlessSwitch.Label
            as="span"
            className="text-sm font-medium leading-6 text-gray-900 dark:text-gray-200"
            passive
          >
            {label}
          </HeadlessSwitch.Label>

          {description && (
            <HeadlessSwitch.Description
              as="span"
              className="text-sm text-gray-500 dark:text-neutral-500"
            >
              {description}
            </HeadlessSwitch.Description>
          )}
        </span>
      )}

      <HeadlessSwitch
        disabled={disabled}
        checked={checked}
        onChange={onChange}
        className={cx(
          "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:cursor-not-allowed dark:focus:ring-offset-neutral-900",
          {
            "bg-indigo-600": checked,
            "bg-gray-200 dark:bg-neutral-800": !checked,
          },
        )}
      >
        <span
          aria-hidden="true"
          className={cx(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
            {
              "translate-x-5": checked,
              "translate-x-0": !checked,
            },
          )}
        />
      </HeadlessSwitch>
    </HeadlessSwitch.Group>
  );
}

export interface SwitchProps {
  label?: string;
  description?: string;
  disabled?: boolean;
  checked: boolean;
  onChange?: (checked: boolean) => void;
}
