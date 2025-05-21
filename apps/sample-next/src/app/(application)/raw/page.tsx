"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/page-header";

export default function Raw() {
  const path = usePathname();
  const searchParams = useSearchParams();

  return (
    <>
      <PageHeader title="Raw URL" message="Inspect the URL and its search parameters." />

      <div className="flex flex-col gap-8">
        <div>
          <p className="text-sm font-medium text-gray-900 truncate dark:text-white">URL</p>
          <p className="text-sm text-gray-500 truncate dark:text-gray-200">{path}</p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
            Search parameters
          </p>

          {[...searchParams].map(([key, value]) => (
            <div key={key}>
              <p className="text-sm font-medium text-gray-500 truncate dark:text-gray-200">{key}</p>
              <p className="text-sm text-gray-500 truncate dark:text-gray-200">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
