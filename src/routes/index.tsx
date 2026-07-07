import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { AppShell } from "@/components/AppShell";
import { useSimulationLoop } from "@/hooks/useSimulationLoop";
import { useStadiumStore } from "@/store/useStadiumStore";
import { NodeCard } from "@/components/NodeCard";
import { PredictionsFeed } from "@/components/PredictionsFeed";
import { MatchCard } from "@/components/MatchCard";
import { Cloud, Thermometer, Wind } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Live Ops · ArenaFlow Nexus" },
      {
        name: "description",
        content:
          "Real-time stadium operations dashboard: live crowd density, predictive AI alerts, and match context.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { t } = useTranslation();
  const { weather, matchCtx, matches } = useSimulationLoop();
  const nodes = useStadiumStore((s) => s.nodes);

  return (
    <AppShell>
      <section className="mb-6">
        <h1 className="text-3xl font-black leading-tight text-white sm:text-4xl">
          {t("appName")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-white/60">{t("tagline")}</p>
      </section>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MatchCard matchCtx={matchCtx} matches={matches} />
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">
            Live weather · NY host city
          </div>
          {weather ? (
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2 text-3xl font-black text-white">
                <Thermometer size={22} style={{ color: "var(--team-accent)" }} />
                {weather.tempC.toFixed(1)}°C
              </div>
              <div className="flex items-center gap-3 text-xs text-white/60">
                <span className="flex items-center gap-1">
                  <Cloud size={12} />
                  {weather.condition}
                </span>
                <span className="flex items-center gap-1">
                  <Wind size={12} />
                  {weather.windKph.toFixed(0)} km/h
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-2 text-sm text-white/50">Fetching…</div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section aria-label={t("liveNodes")}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">{t("liveNodes")}</h2>
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/40">
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full"
                style={{ backgroundColor: "var(--team-accent)" }}
              />
              Simulated sensor layer · updates every 4s
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {nodes.map((n) => (
              <NodeCard key={n.id} node={n} />
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <PredictionsFeed weather={weather} matchCtx={matchCtx} />
        </aside>
      </div>
    </AppShell>
  );
}
