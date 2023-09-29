"use client";

import { createContext, PropsWithChildren, useContext, useMemo, useState } from "react";

export interface NavigationState {
  sidebar: {
    isOpen: boolean;
    setOpen: (open: boolean) => void;
  };
}

const NavigationContext = createContext<NavigationState | undefined>(undefined);

export function NavigationProvider({ children }: PropsWithChildren) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const state = useMemo<NavigationState>(
    () => ({
      sidebar: {
        isOpen: sidebarOpen,
        setOpen: setSidebarOpen,
      },
    }),
    [sidebarOpen, setSidebarOpen],
  );

  return <NavigationContext.Provider value={state}>{children}</NavigationContext.Provider>;
}

export function useNavigation(): NavigationState {
  const state = useContext(NavigationContext);

  if (!state) {
    throw new Error("Unable to find the NavigationProvider in the component tree.");
  }

  return state;
}
