import { ChangeEventHandler, HTMLInputTypeAttribute } from "react";

export function InputField({
  id,
  label,
  type = "text",
  disabled = false,
  placeholder,
  value,
  onChange,
  className,
}: InputFieldProps) {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 mb-2"
        >
          {label}
        </label>
      )}

      <input
        id={id}
        type={type}
        className="block w-full rounded-md border-0 py-1.5 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-950 placeholder:text-gray-400 dark:placeholder:text-neutral-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

export interface InputFieldProps {
  id: string;
  label?: string;
  type?: HTMLInputTypeAttribute;
  disabled?: boolean;
  placeholder?: string;
  value?: string | number;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  className?: string;
}
