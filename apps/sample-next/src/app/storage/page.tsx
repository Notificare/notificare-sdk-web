"use client";

import { useEffect, useState } from "react";
import { useNotificare } from "@/context/notificare";
import { fetchAssets, NotificareAsset } from "notificare-web/assets";

export default function Storage() {
  const notificareState = useNotificare();
  const [assets, setAssets] = useState<NotificareAsset[]>([]);

  useEffect(() => {
    if (notificareState !== "launched") {
      setAssets([]);
      return;
    }

    (async () => {
      try {
        const assets = await fetchAssets("sample_asset");
        setAssets(assets);
      } catch (e) {
        console.error(`Something went wrong: ${e}`);
        setAssets([]);
      }
    })();
  }, [notificareState]);

  return (
    <>
      {notificareState !== "launched" ? (
        <p>stuff is not ready</p>
      ) : (
        <>
          {assets.length === 0 && <p>No items.</p>}

          <div className="space-y-4">
            {assets.map((asset) => (
              <Asset key={asset.id} asset={asset} />
            ))}
          </div>
        </>
      )}
    </>
  );
}

function Asset({ asset }: InboxItemProps) {
  return (
    <div className="max-w-md mx-auto bg-white dark:bg-black rounded shadow-md overflow-hidden md:max-w-2xl p-3 cursor-pointer">
      <textarea
        rows={10}
        className="block w-full rounded-md border-0 p-1.5 font-mono text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        value={JSON.stringify(asset, null, 2)}
        readOnly
      />
    </div>
  );
}

interface InboxItemProps {
  asset: NotificareAsset;
}
