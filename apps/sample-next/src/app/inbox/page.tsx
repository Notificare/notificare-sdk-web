"use client";

import { useNotificare } from "@/hooks/use-notificare";
import { useEffect, useState } from "react";
import {
  fetchInbox,
  NotificareInboxItem,
  openInboxItem,
} from "@notificare/inbox";
import { formatDistanceToNow, parseISO } from "date-fns";
import { presentNotification } from "@notificare/push-ui";

export default function Inbox() {
  const { state } = useNotificare();
  const [items, setItems] = useState<NotificareInboxItem[]>([]);

  useEffect(() => {
    if (state !== "ready") {
      setItems([]);
      return;
    }

    (async () => {
      try {
        const { items } = await fetchInbox();
        setItems(items);
      } catch (e) {
        console.error(`Something went wrong: ${e}`);
      }
    })();
  }, [state]);

  const onInboxItemClicked = async (item: NotificareInboxItem) => {
    try {
      const notification = await openInboxItem(item);
      presentNotification(notification);
    } catch (e) {
      console.error(`Something went wrong: ${e}`);
    }
  };

  return (
    <>
      {state !== "ready" ? (
        <p>stuff is not ready</p>
      ) : (
        <>
          {items.length === 0 && <p>No items.</p>}

          <div className="space-y-4">
            {items.map((item) => (
              <InboxItem
                key={item.id}
                item={item}
                onClick={() => onInboxItemClicked(item)}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}

export function InboxItem({ item, onClick }: InboxItemProps) {
  return (
    <div
      className="max-w-md mx-auto bg-white dark:bg-black rounded shadow-md overflow-hidden md:max-w-2xl p-3 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        <InboxItemImage item={item} />

        <div className="flex-1 min-w-0">
          {item.notification.title && (
            <p className="text-lg font-medium text-gray-900 truncate dark:text-white">
              {item.notification.title}
            </p>
          )}

          {item.notification.subtitle && (
            <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
              {item.notification.subtitle}
            </p>
          )}

          <p className="text-sm text-gray-500 truncate dark:text-gray-400">
            {item.notification.message}
          </p>
        </div>

        <div className="flex flex-col items-end space-y-1">
          {!item.opened && <div className="w-2 h-2 rounded-full bg-blue-500" />}

          <div className="inline-flex items-center text-sm text-gray-900 dark:text-white">
            {formatDistanceToNow(parseISO(item.time), { addSuffix: true })}
          </div>
        </div>
      </div>
    </div>
  );
}

interface InboxItemProps {
  item: NotificareInboxItem;
  onClick: () => void;
}

function InboxItemImage({ item }: InboxItemImageProps) {
  const attachment = item.notification.attachments[0];

  return (
    <div className="flex-shrink-0">
      {attachment && (
        <img
          className="w-32 h-24 rounded object-cover"
          src={attachment.uri}
          alt="Notification attachment"
        />
      )}

      {!attachment && <div className="w-32 h-24 rounded bg-gray-100" />}
    </div>
  );
}

interface InboxItemImageProps {
  item: NotificareInboxItem;
}
