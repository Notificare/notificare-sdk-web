"use client";

import { useEffect, useState } from "react";
import {
  fetchInbox,
  getBadge,
  NotificareInboxItem,
  onBadgeUpdated,
  openInboxItem,
  onInboxUpdated,
} from "notificare-web/inbox";
import { formatDistanceToNow, parseISO } from "date-fns";
import { presentNotification } from "notificare-web/push-ui";
import { useNotificare } from "@/context/notificare";
import Image from "next/image";

export default function Inbox() {
  const notificareState = useNotificare();
  const [inboxFetchTimestamp, setInboxFetchTimestamp] = useState<number>(0);
  const [badge, setBadge] = useState<number>(0);
  const [items, setItems] = useState<NotificareInboxItem[]>([]);

  useEffect(function setupListeners() {
    const subscriptions = [
      onBadgeUpdated((badge) => setBadge(badge)),
      onInboxUpdated(() => setInboxFetchTimestamp(Date.now())),
    ];

    return () => subscriptions.forEach((sub) => sub.remove());
  }, []);

  useEffect(
    function reloadInbox() {
      if (notificareState !== "launched") {
        setBadge(0);
        setItems([]);
        return;
      }

      setBadge(getBadge());

      fetchInbox()
        .then(({ items }) => setItems(items))
        .catch((e) => console.error(`Something went wrong: ${e}`));
    },
    [notificareState, inboxFetchTimestamp],
  );

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
      {notificareState !== "launched" ? (
        <p>stuff is not ready</p>
      ) : (
        <>
          {items.length === 0 && (
            <div className="max-w-md mx-auto bg-white dark:bg-neutral-900 rounded shadow-md overflow-hidden md:max-w-2xl p-3">
              <p className="text-lg font-medium text-gray-900 truncate dark:text-white">
                No items.
              </p>
            </div>
          )}

          {items.length !== 0 && (
            <>
              <div className="mb-6 max-w-md mx-auto bg-white dark:bg-neutral-900 rounded shadow-md overflow-hidden md:max-w-2xl p-3">
                <p className="text-lg font-medium text-gray-900 truncate dark:text-white">
                  Current badge: {badge}
                </p>
              </div>

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
      )}
    </>
  );
}

function InboxItem({ item, onClick }: InboxItemProps) {
  return (
    <div
      className="max-w-md mx-auto bg-white dark:bg-neutral-900 rounded shadow-md overflow-hidden md:max-w-2xl p-3 cursor-pointer"
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

          <p className="text-sm text-gray-500 truncate dark:text-gray-200">
            {item.notification.message}
          </p>

          <p className="text-xs text-gray-500 truncate dark:text-gray-200">
            {item.notification.type}
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
        <Image
          width={128}
          height={96}
          className="w-32 h-24 rounded object-cover"
          src={attachment.uri}
          alt="Notification attachment"
        />
      )}

      {!attachment && (
        <div className="w-32 h-24 rounded bg-gray-100 dark:bg-neutral-800" />
      )}
    </div>
  );
}

interface InboxItemImageProps {
  item: NotificareInboxItem;
}
