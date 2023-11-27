"use client";

import { Bars3Icon, BellIcon } from "@heroicons/react/24/outline";
import { useNavigation } from "@/context/navigation";
import { InboxBell } from "@/components/navigation/inbox-bell";

export function StickyNavigation() {
  const { sidebar } = useNavigation();

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        onClick={() => sidebar.setOpen(!sidebar.isOpen)}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 flex-row-reverse gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <InboxBell />

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

          <div className="-m-1.5 flex items-center p-1.5">
            <img
              className="h-8 w-8 rounded-full bg-gray-50"
              src="https://www.gravatar.com/avatar/1a73f51bd2d8f8114835508ecd678c66?s=128&d=https://dashboard.notifica.re/assets/images/no-gravatar-blue.png"
              alt=""
            />
            <span className="hidden lg:flex lg:items-center">
              <span
                className="ml-4 text-sm font-semibold leading-6 text-gray-900"
                aria-hidden="true"
              >
                Helder Pinhal
              </span>
            </span>
          </div>
        </div>

        {/*<form className="relative flex flex-1" action="#" method="GET">*/}
        {/*  <label htmlFor="search-field" className="sr-only">*/}
        {/*    Search*/}
        {/*  </label>*/}
        {/*  <MagnifyingGlassIcon*/}
        {/*    className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"*/}
        {/*    aria-hidden="true"*/}
        {/*  />*/}
        {/*  <input*/}
        {/*    id="search-field"*/}
        {/*    className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"*/}
        {/*    placeholder="Search..."*/}
        {/*    type="search"*/}
        {/*    name="search"*/}
        {/*  />*/}
        {/*</form>*/}
      </div>
    </div>
  );
}
