import Image from "next/image";
import spinnerIcon from "../../public/assets/circular-spinner.svg";

export function ProgressIndicator({ title, message }: ProgressIndicatorProps) {
  return (
    <div>
      <h3 className="flex items-center text-lg font-semibold leading-7 text-gray-900 sm:truncate sm:text-xl sm:tracking-tight dark:text-white">
        {title}
        <Image src={spinnerIcon} alt="" className="animate-spin ml-3 h-5 w-5" />
      </h3>

      <span className="mt-1 sm:mt-0 text-sm text-gray-500 dark:text-gray-300">{message}</span>
    </div>
  );
}

export interface ProgressIndicatorProps {
  title: string;
  message: string;
}
