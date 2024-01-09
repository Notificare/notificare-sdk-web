export function Button({ text, disabled, onClick }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-600 disabled:cursor-not-allowed"
    >
      {text}
    </button>
  );
}

export interface ButtonProps {
  text: string;
  disabled?: boolean;
  onClick: () => void;
}
