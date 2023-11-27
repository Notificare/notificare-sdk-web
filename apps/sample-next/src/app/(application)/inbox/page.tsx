"use client";

import { PageHeader, PageHeaderAction } from "@/components/page-header";
import { EnvelopeOpenIcon, TrashIcon } from "@heroicons/react/24/solid";
import { NotificareLaunchBlocker } from "@/components/notificare/notificare-launch-blocker";
import { useCallback, useEffect, useState } from "react";
import {
  clearInbox,
  fetchInbox,
  markAllInboxItemsAsRead,
  NotificareInboxItem,
  openInboxItem,
} from "notificare-web/inbox";
import { presentNotification } from "notificare-web/push-ui";
import { ProgressIndicator } from "@/components/progress-indicator";
import { Alert } from "@/components/alert";
import { InboxItem } from "@/components/inbox";
import { useNotificareState } from "@/notificare/hooks/notificare-state";
import { useOnInboxUpdated } from "@/notificare/hooks/events/inbox/inbox-updated";

export default function Inbox() {
  const state = useNotificareState();
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);
  const [inboxState, setInboxState] = useState<InboxState>({ status: "loading" });

  useEffect(
    function reloadInbox() {
      if (state.status !== "launched") return;

      fetchInbox()
        .then(({ items }) => setInboxState({ status: "success", items }))
        .catch((error) => setInboxState({ status: "failure", error }));
    },
    [state, reloadTrigger],
  );

  const forceInboxReload = useCallback(() => {
    setReloadTrigger((prevState) => prevState + 1);
  }, []);

  useOnInboxUpdated(() => forceInboxReload());

  const openItem = useCallback((item: NotificareInboxItem) => {
    openInboxItem(item)
      .then((notification) => presentNotification(notification))
      .catch((error) => console.log(`Unable to open inbox item: ${error}`));
  }, []);

  const markAllItemsAsRead = useCallback(() => {
    markAllInboxItemsAsRead()
      .then(() => forceInboxReload())
      .catch((error) => setInboxState({ status: "failure", error }));
  }, [forceInboxReload]);

  const removeAllItems = useCallback(() => {
    clearInbox()
      .then(() => forceInboxReload())
      .catch((error) => setInboxState({ status: "failure", error }));
  }, [forceInboxReload]);

  return (
    <>
      <PageHeader
        title="Inbox"
        message="Easily manage your messages, conversations, and notifications in one centralized hub."
        actions={
          <>
            {state.status === "launched" && (
              <>
                <PageHeaderAction
                  label="Mark all as read"
                  icon={EnvelopeOpenIcon}
                  onClick={markAllItemsAsRead}
                />

                <PageHeaderAction label="Remove all" icon={TrashIcon} onClick={removeAllItems} />
              </>
            )}
          </>
        }
      />

      <NotificareLaunchBlocker>
        {inboxState.status === "loading" && (
          <ProgressIndicator title="Loading..." message="Slower than a stormtrooper's aim." />
        )}

        {inboxState.status === "success" && (
          <div className="flex flex-col gap-8">
            {inboxState.items.map((item) => (
              <InboxItem key={item.id} item={item} onClick={() => openItem(item)} />
            ))}
          </div>
        )}

        {inboxState.status === "failure" && (
          <Alert
            variant="error"
            message="Oops! The Force is not strong with this one."
            action={{ label: "Reload", onClick: forceInboxReload }}
          />
        )}
      </NotificareLaunchBlocker>
    </>
  );
}

type InboxState = LoadingInboxState | SuccessInboxState | FailureInboxState;

type State<T extends string> = { status: T };

type LoadingInboxState = State<"loading">;

type SuccessInboxState = State<"success"> & {
  items: NotificareInboxItem[];
};

type FailureInboxState = State<"failure"> & {
  error: Error;
};
