"use client";

import { useCallback, useEffect, useState } from "react";
import { TagIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { addTag, fetchTags, removeTag } from "notificare-web/core";
import { Alert } from "@/components/alert";
import { Button } from "@/components/button";
import { InputField } from "@/components/input-field";
import { NotificareLaunchBlocker } from "@/components/notificare/notificare-launch-blocker";
import { PageHeader } from "@/components/page-header";
import { ProgressIndicator } from "@/components/progress-indicator";
import { useNotificareState } from "@/notificare/hooks/notificare-state";

export default function Segmentation() {
  const state = useNotificareState();
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);
  const [segmentationState, setSegmentationState] = useState<SegmentationState>({ status: "idle" });
  const [tag, setTag] = useState("");

  useEffect(
    function reloadDeviceTags() {
      if (state.status !== "launched") return;

      fetchTags()
        .then((tags) => {
          if (tags.length) {
            setSegmentationState({ status: "success", tags });
          } else {
            setSegmentationState({ status: "empty" });
          }
        })
        .catch(() => setSegmentationState({ status: "failure" }));
    },
    [state, reloadTrigger],
  );

  const createTagCallback = useCallback(async () => {
    try {
      setSegmentationState({ status: "loading" });
      await addTag(tag);
      setTag("");
      setReloadTrigger((prevState) => prevState + 1);
    } catch (e) {
      setSegmentationState({ status: "failure" });
    }
  }, [tag]);

  const removeTagCallback = useCallback(async (tag: string) => {
    try {
      setSegmentationState({ status: "loading" });
      await removeTag(tag);
      setReloadTrigger((prevState) => prevState + 1);
    } catch (e) {
      setSegmentationState({ status: "failure" });
    }
  }, []);

  return (
    <>
      <PageHeader
        title="Segmentation"
        message="Segment your audience with a flexible tag structure."
      />

      <NotificareLaunchBlocker>
        <div className="md:max-w-2xl">
          <div className="flex flex-row gap-4 mb-10 items-end">
            <InputField
              className="flex-grow"
              id="tag-input"
              label="Create a new tag"
              type="text"
              placeholder="e.g. tag_newsletter"
              value={tag}
              onChange={(event) => setTag(event.target.value)}
            />

            <Button text="Create" onClick={createTagCallback} />
          </div>

          {segmentationState.status === "loading" && (
            <ProgressIndicator title="Loading..." message="Slower than a stormtrooper's aim." />
          )}

          {segmentationState.status === "empty" && (
            <Alert variant="info" message="There's nothing to see here. Move along now..." />
          )}

          {segmentationState.status === "failure" && (
            <Alert
              variant="error"
              message="Oops! The Force is not strong with this one. Check your console for more information."
            />
          )}

          {segmentationState.status === "success" && (
            <div className="flex flex-col gap-4">
              {segmentationState.tags.map((tag) => (
                <TagCard key={tag} tag={tag} onClick={() => removeTagCallback(tag)} />
              ))}
            </div>
          )}
        </div>
      </NotificareLaunchBlocker>
    </>
  );
}

type SegmentationState = IdleState | LoadingState | SuccessState | EmptyState | FailureState;

type State<T extends string> = { status: T };

type IdleState = State<"idle">;

type LoadingState = State<"loading">;

type SuccessState = State<"success"> & {
  tags: string[];
};

type EmptyState = State<"empty">;

type FailureState = State<"failure">;

function TagCard({ tag, onClick }: { tag: string; onClick: () => void }) {
  return (
    <div className="flex flex-row gap-4 items-center bg-white dark:bg-neutral-900 rounded shadow-md p-3">
      <div className="p-2.5 text-gray-400">
        <TagIcon className="h-6 w-6" />
      </div>

      <p className="flex-grow text-lg font-medium text-gray-900 truncate dark:text-white">{tag}</p>

      <button className="p-2.5 text-gray-400 hover:text-gray-500" onClick={onClick}>
        <div className="relative">
          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
        </div>
      </button>
    </div>
  );
}
