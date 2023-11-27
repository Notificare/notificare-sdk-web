import { PropsWithChildren } from "react";

export function Card({ children }: PropsWithChildren) {
  return <div className="bg-white rounded-lg shadow dark:bg-slate-900">{children}</div>;
}

export function CardHeader({ title }: CardHeaderProps) {
  return (
    <div className="p-6 border-b border-gray-200">
      <h5 className="text-base font-semibold leading-6 text-gray-900">{title}</h5>
    </div>
  );
}

interface CardHeaderProps {
  title: string;
}

export function CardContent({ children }: PropsWithChildren) {
  return <div className="flex flex-grow flex-col gap-6 p-6">{children}</div>;
}

export function CardActions({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-shrink-0 flex-row justify-end gap-6 p-6 border-t border-gray-200">
      {children}
    </div>
  );
}
