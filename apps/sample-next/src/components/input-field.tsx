import { ChangeEventHandler, HTMLInputTypeAttribute } from "react";

export function InputField({
  id,
  label,
  type = "text",
  disabled = false,
  placeholder,
  value,
  onChange,
}: InputFieldProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium leading-6 text-gray-900 mb-2">
          {label}
        </label>
      )}

      <input
        id={id}
        type={type}
        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
}
