"use client";

import { SideBarNavigationItem, sideBarNavigationItems } from "@/data/navigation";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { classNames } from "@/utils/css";

export function Sidebar() {
  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center">
        <img className="h-8 w-auto" src="/assets/notificare-logo.svg" alt="Notificare" />
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {sideBarNavigationItems.map((item) => (
                <NavigationItem key={item.href} item={item} />
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
}

function NavigationItem({ item }: NavigationItemProps) {
  const { label, href, icon: Icon } = item;

  const pathname = usePathname();
  const isActive = useMemo(
    () => pathname === href || (href !== "/" && pathname.startsWith(href)),
    [pathname, href],
  );

  return (
    <li>
      <a
        href={href}
        className={classNames(
          isActive
            ? "bg-gray-50 text-indigo-600"
            : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50",
          "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold",
        )}
      >
        <Icon
          className={classNames(
            isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-indigo-600",
            "h-6 w-6 shrink-0",
          )}
          aria-hidden="true"
        />
        {label}
      </a>
    </li>
  );
}

interface NavigationItemProps {
  item: SideBarNavigationItem;
}
