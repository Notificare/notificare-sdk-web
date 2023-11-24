"use client";

import { PageHeader } from "@/components/page-header";
import { LaunchFlowCard } from "@/components/launch-flow-card";
import { NotificareConfigurationBlocker } from "@/components/notificare/notificare-configuration-blocker";
import { DeviceRegistrationCard } from "@/components/home/device-registration-card";
import { NotificationsCard } from "@/components/home/notifications-card";
import { DoNotDisturbCard } from "@/components/home/do-not-disturb-card";
import { useNotificareState } from "@/notificare/hooks/notificare-state";
import { LocationCard } from "@/components/home/location-card";
import { InAppMessagingCard } from "@/components/home/in-app-messaging-card";

export default function Home() {
  const state = useNotificareState();

  return (
    <>
      <PageHeader
        title="Welcome to the Notificare sample app"
        message="Because every superhero needs a sidekick."
      />

      <NotificareConfigurationBlocker>
        <div className="grid grid-flow-row grid-cols-1 md:grid-cols-2 gap-8">
          <LaunchFlowCard />

          {state.status === "launched" && (
            <>
              <DeviceRegistrationCard />
              <NotificationsCard />
              <DoNotDisturbCard />
              <LocationCard />
              <InAppMessagingCard />
            </>
          )}
        </div>
      </NotificareConfigurationBlocker>
    </>
  );
}
