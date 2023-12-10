import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";
import cx from "classnames";
import Link from "next/link";

export function Alert({ variant = "info", message, action }: AlertProps) {
  return (
    <div className={cx("rounded-md p-4", AlertBackgroundColor[variant])}>
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertIcon variant={variant} />
        </div>

        <div className="ml-3 flex-1 md:flex md:justify-between">
          <p className={cx("text-sm", AlertTextColor[variant])}>{message}</p>

          {action && (
            <p className="mt-3 text-sm md:ml-6 md:mt-0">
              {action.url && (
                <Link
                  href={action.url}
                  className={cx("whitespace-nowrap font-medium", AlertLinkTextColor[variant])}
                >
                  {action.label}
                  <span> &rarr;</span>
                </Link>
              )}

              {action.onClick && (
                <button
                  onClick={action.onClick}
                  className={cx("whitespace-nowrap font-medium", AlertLinkTextColor[variant])}
                >
                  {action.label}
                  <span> &rarr;</span>
                </button>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export interface AlertProps {
  variant?: AlertVariant;
  message: string;
  action?: {
    label: string;
    url?: string;
    onClick?: () => void;
  };
}

export type AlertVariant = "info" | "warning" | "error";

const AlertBackgroundColor: Record<AlertVariant, string> = {
  info: "bg-blue-50",
  warning: "bg-yellow-50",
  error: "bg-red-50",
};

const AlertTextColor: Record<AlertVariant, string> = {
  info: "text-blue-700",
  warning: "text-yellow-700",
  error: "text-red-700",
};

const AlertLinkTextColor: Record<AlertVariant, string> = {
  info: "text-blue-700 hover:text-blue-600",
  warning: "text-yellow-700 hover:text-yellow-600",
  error: "text-red-700 hover:text-red-600",
};

function AlertIcon({ variant }: AlertIconProps) {
  switch (variant) {
    case "info":
      return <InformationCircleIcon className="h-5 w-5 text-blue-400" />;
    case "warning":
      return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />;
    case "error":
      return <XCircleIcon className="h-5 w-5 text-red-400" />;
  }
}

interface AlertIconProps {
  variant: AlertVariant;
}
