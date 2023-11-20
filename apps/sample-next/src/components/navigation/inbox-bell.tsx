import { useState } from "react";
import Link from "next/link";
import { getBadge } from "notificare-web/inbox";
import { BellIcon } from "@heroicons/react/24/outline";
import { useOnBadgeUpdated } from "@/notificare/hooks/events/inbox/badge-updated";

export function InboxBell() {
  const [badge, setBadge] = useState<number>(getBadge);

  useOnBadgeUpdated((badge) => setBadge(badge));

  return (
    <Link href="/inbox" className="group p-2.5 text-gray-400 hover:text-gray-500">
      <span className="sr-only">View notifications</span>
      <div className="relative">
        <BellIcon className="h-6 w-6" aria-hidden="true" />

        {!!badge && badge > 0 && (
          <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-indigo-400 rounded-full transform -translate-x-1/4 group-hover:bg-indigo-600" />
        )}
      </div>
    </Link>
  );
}
