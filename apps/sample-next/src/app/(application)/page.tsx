"use client";

import { PageHeader } from "@/components/page-header";
import { LaunchFlowCard } from "@/components/launch-flow-card";
import { useLaunchFlow } from "@/context/launch-flow";
import { NotificareConfigurationBlocker } from "@/components/notificare/notificare-configuration-blocker";

export default function Home() {
  const { state } = useLaunchFlow();

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
              <div className="h-40 bg-slate-200"></div>
              <div className="h-96 bg-slate-200"></div>
              <div className="h-96 bg-slate-200"></div>
              <div className="h-96 bg-slate-200"></div>
            </>
          )}
        </div>
      </NotificareConfigurationBlocker>
    </>
  );
}
