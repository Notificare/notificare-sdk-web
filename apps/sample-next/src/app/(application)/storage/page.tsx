"use client";

import { useState } from "react";
import { fetchAssets, NotificareAsset } from "notificare-web/assets";
import { NotificareNetworkRequestError } from "notificare-web/core";
import { Alert } from "@/components/alert";
import { InputField } from "@/components/input-field";
import { NotificareLaunchBlocker } from "@/components/notificare/notificare-launch-blocker";
import { PageHeader } from "@/components/page-header";
import { ProgressIndicator } from "@/components/progress-indicator";
import { AssetPreview } from "@/components/storage";
import { useDebounce } from "@/hooks/debounce";
import { logger } from "@/utils/logger";

export default function Storage() {
  const [search, setSearch] = useState<string>("");
  const [state, setState] = useState<SearchAssetsState>({ status: "idle" });

  const searchAssets = useDebounce(async () => {
    setState({ status: "loading" });

    try {
      const assets = await fetchAssets(search);
      if (assets.length) {
        setState({ status: "success", assets });
      } else {
        setState({ status: "empty" });
      }
    } catch (e) {
      if (e instanceof NotificareNetworkRequestError && e.response.status === 404) {
        setState({ status: "not-found" });
        return;
      }

      logger.error(`Unable to find the asset group: ${e}`);
      setState({ status: "failure" });
    }
  });

  return (
    <>
      <PageHeader title="Storage" message="Swift access to the right data at the right moment." />

      <NotificareLaunchBlocker>
        <div className="md:max-w-2xl">
          <div className="mb-10">
            <InputField
              id="search-box"
              label="Search for an asset group"
              type="text"
              placeholder="e.g. landscapes"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                searchAssets();
              }}
            />
          </div>

          {state.status === "loading" && (
            <ProgressIndicator title="Searching..." message="Slower than a stormtrooper's aim." />
          )}

          {state.status === "empty" && (
            <Alert variant="warning" message="There's nothing to see here. Move along now..." />
          )}

          {state.status === "not-found" && (
            <Alert
              variant="warning"
              message="Asset group not found. These are not the assets you're looking for."
            />
          )}

          {state.status === "failure" && (
            <Alert
              variant="error"
              message="Oops! The Force is not strong with this one. Check your console for more information."
            />
          )}

          {state.status === "success" && (
            <div className="flex flex-col gap-4">
              {state.assets.map((asset) => (
                <AssetPreview key={asset.id} asset={asset} />
              ))}
            </div>
          )}
        </div>
      </NotificareLaunchBlocker>
    </>
  );
}

type SearchAssetsState =
  | IdleState
  | LoadingState
  | SuccessState
  | EmptyState
  | NotFoundState
  | FailureState;

type State<T extends string> = { status: T };

type IdleState = State<"idle">;

type LoadingState = State<"loading">;

type SuccessState = State<"success"> & {
  assets: NotificareAsset[];
};

type EmptyState = State<"empty">;

type NotFoundState = State<"not-found">;

type FailureState = State<"failure">;
