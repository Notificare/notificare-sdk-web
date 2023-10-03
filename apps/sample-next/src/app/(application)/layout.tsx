import { PropsWithChildren } from "react";
import { Sidebar } from "@/components/navigation/sidebar";
import { MobileSidebar } from "@/components/navigation/mobile-sidebar";
import { StickyNavigation } from "@/components/navigation/sticky-navigation";
import { NavigationProvider } from "@/context/navigation";
import { LaunchFlowProvider } from "@/context/launch-flow";
import { NotificareAutoLauncher } from "@/components/notificare/notificare-auto-launcher";
import { NotificareEventListener } from "@/components/notificare/notificare-event-listener";

export default function ApplicationLayout({ children }: PropsWithChildren) {
  return (
    <LaunchFlowProvider>
      <NotificareAutoLauncher />
      <NotificareEventListener />

      <NavigationProvider>
        <MobileSidebar />

        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <Sidebar />
        </div>

        <div className="lg:pl-72">
          <StickyNavigation />

          <main className="py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </NavigationProvider>
    </LaunchFlowProvider>
  );
}
