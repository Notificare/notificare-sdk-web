import { PageHeader } from "@/components/page-header";
import { LaunchFlowCard } from "@/components/launch-flow-card";

export default function Home() {
  return (
    <>
      <PageHeader
        title="Welcome to the Notificare sample app"
        message="Because every superhero needs a sidekick."
      />

      <div className="grid grid-flow-row grid-cols-1 md:grid-cols-2 gap-8">
        <LaunchFlowCard />

        <div className="h-40 bg-slate-200"></div>
        <div className="h-96 bg-slate-200"></div>
        <div className="h-96 bg-slate-200"></div>
        <div className="h-96 bg-slate-200"></div>
      </div>
    </>
  );
}
