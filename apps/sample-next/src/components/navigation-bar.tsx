"use client";

import { classNames } from "@/utils/css";
import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const navigation = [
  { name: "Home", href: "/", current: false },
  { name: "Inbox", href: "/inbox", current: false },
  { name: "Locations", href: "/locations", current: false },
  { name: "Settings", href: "/settings", current: false },
];

export function NavigationBar() {
  return (
    <Disclosure as="nav" className="bg-neutral-900">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Image
                    src="/assets/notificare-logo-dark.svg"
                    alt="Notificare"
                    width={172}
                    height={34}
                  />
                </div>

                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    {navigation.map((item) => (
                      <NavigationItem
                        key={item.name}
                        variant="desktop"
                        text={item.name}
                        href={item.href}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="-mr-2 flex md:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-neutral-900 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-800">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
              {navigation.map((item) => (
                <NavigationItem
                  key={item.name}
                  variant="mobile"
                  text={item.name}
                  href={item.href}
                />
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}

function NavigationItem({ variant, text, href }: NavigationItemProps) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/" && pathname.startsWith(href));

  switch (variant) {
    case "desktop":
      return (
        <Link
          href={href}
          className={classNames(
            isActive
              ? "bg-neutral-600 text-white"
              : "text-gray-300 hover:bg-neutral-700 hover:text-white",
            "rounded-md px-3 py-2 text-sm font-medium",
          )}
          aria-current={isActive ? "page" : undefined}
        >
          {text}
        </Link>
      );

    case "mobile":
      return (
        <Link href={href} legacyBehavior>
          <Disclosure.Button
            as="a"
            className={classNames(
              isActive
                ? "bg-neutral-600 text-white"
                : "text-gray-300 hover:bg-neutral-700 hover:text-white",
              "block rounded-md px-3 py-2 text-base font-medium",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {text}
          </Disclosure.Button>
        </Link>
      );
  }
}

interface NavigationItemProps {
  text: string;
  href: string;
  variant: "desktop" | "mobile";
}
