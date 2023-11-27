import { ComponentType, PropsWithoutRef, ReactNode, SVGProps } from "react";

export function PageHeader({ title, message, actions }: PageHeaderProps) {
  return (
    <>
      <div className="mb-10 flex flex-col gap-x-8 gap-y-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight dark:text-white">
            {title}
          </h2>

          <span className="mt-1 sm:mt-0 text-sm text-gray-500 dark:text-gray-300">{message}</span>
        </div>

        {actions && <div className="flex flex-shrink-0 flex-wrap gap-3">{actions}</div>}
      </div>
    </>
  );
}

export interface PageHeaderProps {
  title: string;
  message: string;
  actions?: ReactNode;
}

export function PageHeaderAction({ label, icon: Icon, onClick }: PageHeaderActionProps) {
  return (
    <button
      type="button"
      className="inline-flex items-center rounded-md p-3 bg-indigo-100 text-indigo-600 shadow-sm hover:bg-indigo-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      onClick={onClick}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span className="ml-2 sm:hidden">{label}</span>
    </button>
  );
}

export interface PageHeaderActionProps {
  label: string;
  icon: ComponentType<PropsWithoutRef<SVGProps<SVGSVGElement>>>;
  onClick: () => void;
}
