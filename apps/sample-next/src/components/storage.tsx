import Image from "next/image";
import Link from "next/link";
import { NotificareAsset } from "notificare-web/assets";

export function AssetPreview({ asset }: AssetPreviewProps) {
  return (
    <div className="flex flex-col gap-4 bg-white dark:bg-neutral-900 rounded shadow-md p-3 overflow-hidden">
      <div className="flex flex-row gap-4">
        <AssetImage url={asset.url} />

        <div className="flex flex-col overflow-hidden">
          <p className="text-lg font-medium text-gray-900 truncate dark:text-gray-200">
            {asset.title}
          </p>

          {asset.description && (
            <p className="text-xs text-gray-500 truncate dark:text-neutral-500">
              {asset.description}
            </p>
          )}

          {asset.url && (
            <Link href={asset.url} target="_blank" className="truncate text-blue-600">
              {asset.url}
            </Link>
          )}
        </div>
      </div>

      <pre className="bg-gray-200 dark:bg-neutral-800 text-gray-800 dark:text-gray-200 rounded p-4 overflow-scroll">
        {JSON.stringify(asset, null, 2)}
      </pre>
    </div>
  );
}

export interface AssetPreviewProps {
  asset: NotificareAsset;
}

function AssetImage({ url }: { url?: string }) {
  return (
    <div className="flex-shrink-0">
      {url && (
        <Image
          width={128}
          height={96}
          className="w-32 h-24 rounded object-cover"
          src={url}
          alt="Notification attachment"
          priority
        />
      )}

      {!url && <div className="w-32 h-24 rounded bg-gray-100 dark:bg-neutral-800" />}
    </div>
  );
}
