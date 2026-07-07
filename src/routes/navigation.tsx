import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { AppShell } from "@/components/AppShell";
import { useSimulationLoop } from "@/hooks/useSimulationLoop";
import { useStadiumStore } from "@/store/useStadiumStore";
import { useMemo, useState } from "react";
import type { NodeType } from "@/lib/stadium";
import { Utensils, Baby, DoorOpen, Plus, ArrowRight } from "lucide-react";

const DESTINATIONS: Array<{ type: NodeType; label: string; icon: React.ComponentType<{ size?: number }> }> = [
  { type: "food", label: "Food Court", icon: Utensils },
  { type: "washroom", label: "Washroom", icon: Baby },
  { type: "exit", label: "Exit", icon: DoorOpen },
  { type: "medical", label: "Medical", icon: Plus },
];

export const Route = createFileRoute("/navigation")({
  head: () => ({
    meta: [
      { title: "Smart Navigation · ArenaFlow Nexus" },
      {
        name: "description",
        content:
          "Least-congested indoor routing to food, washrooms, exits, and medical stations — computed from live node density.",
      },
    ],
  }),
  component: NavigationPage,
});

function NavigationPage() {
  const { t } = useTranslation();
  useSimulationLoop();
  const nodes = useStadiumStore((s) => s.nodes);
  const [destType, setDestType] = useState<NodeType>("food");

  const ranked = useMemo(
    () =>
      nodes
        .filter((n) => n.type === destType)
        .sort((a, b) => a.crowdDensity - b.crowdDensity),
    [nodes, destType]
  );

  const best = ranked[0];

  return (
    <AppShell>
      <h1 className="text-3xl font-black text-white">{t("nav.navigation")}</h1>
      <p className="mt-1 text-sm text-white/60">
        Smart indoor pathfinding driven by live crowd density.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {DESTINATIONS.map(({ type, label, icon: Icon }) => {
          const active = destType === type;
          return (
            <button
              key={type}
              onClick={() => setDestType(type)}
              className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition"
              style={{
                borderColor: active ? "transparent" : "rgba(255,255,255,0.15)",
                background: active ? "var(--team-gradient)" : "transparent",
                color: active ? "var(--team-primary-contrast)" : "white",
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-6">
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">
            Stadium floor plan · live density
          </div>
          <StadiumMap highlight={best?.id} />
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">
            {t("leastCongested")}
          </div>
          {best ? (
            <>
              <div
                className="mt-2 rounded-3xl border p-5"
                style={{
                  borderColor: "var(--team-primary)",
                  background: "linear-gradient(135deg, rgba(255,255,255,0.05), transparent)",
                }}
              >
                <div className="text-[10px] uppercase tracking-widest text-white/50">
                  {t("routeTo")}
                </div>
                <div className="mt-1 text-2xl font-black text-white">{best.name}</div>
                <div className="mt-1 text-sm text-white/60">
                  {t("viaZone", { zone: best.zone })}
                </div>
                <div className="mt-4 flex gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-white/40">
                      {t("density")}
                    </div>
                    <div
                      className="text-lg font-bold"
                      style={{ color: "var(--team-accent)" }}
                    >
                      {Math.round(best.crowdDensity * 100)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-white/40">
                      {t("wait")}
                    </div>
                    <div className="text-lg font-bold text-white">
                      {best.waitTimeMins} {t("mins")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  Other options
                </div>
                {ranked.slice(1).map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white">{n.name}</div>
                      <div className="text-[10px] uppercase tracking-widest text-white/40">
                        {n.zone}
                      </div>
                    </div>
                    <div className="text-right text-xs text-white/60">
                      {Math.round(n.crowdDensity * 100)}% · {n.waitTimeMins}
                      {t("mins")}
                      <ArrowRight size={12} className="ml-2 inline" />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="mt-2 rounded-3xl border border-white/10 p-5 text-sm text-white/60">
              No matching destination.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function StadiumMap({ highlight }: { highlight?: string }) {
  const nodes = useStadiumStore((s) => s.nodes);
  const positions: Record<string, { x: number; y: number }> = {
    "gate-a": { x: 200, y: 40 },
    "gate-b": { x: 360, y: 200 },
    "gate-c": { x: 40, y: 200 },
    "food-1": { x: 120, y: 130 },
    "food-2": { x: 280, y: 130 },
    "wc-north": { x: 150, y: 90 },
    "wc-south": { x: 250, y: 310 },
    "med-1": { x: 90, y: 260 },
    "med-2": { x: 310, y: 260 },
    "exit-main": { x: 200, y: 360 },
    "parking-1": { x: 350, y: 340 },
  };

  return (
    <svg viewBox="0 0 400 400" className="mt-4 h-[420px] w-full">
      <defs>
        <radialGradient id="pitch" cx="50%" cy="50%">
          <stop offset="0%" stopColor="rgba(34,197,94,0.15)" />
          <stop offset="100%" stopColor="rgba(34,197,94,0)" />
        </radialGradient>
      </defs>
      <ellipse cx="200" cy="200" rx="140" ry="90" fill="url(#pitch)" stroke="rgba(34,197,94,0.35)" strokeWidth={1.5} />
      <ellipse cx="200" cy="200" rx="60" ry="35" fill="none" stroke="rgba(34,197,94,0.25)" strokeWidth={1} />
      <line x1="200" y1="120" x2="200" y2="280" stroke="rgba(34,197,94,0.2)" strokeWidth={1} />

      {nodes.map((n) => {
        const p = positions[n.id];
        if (!p) return null;
        const density = n.crowdDensity;
        const color = density > 0.85 ? "#ef4444" : density > 0.65 ? "#f59e0b" : "#22c55e";
        const isHi = highlight === n.id;
        return (
          <g key={n.id}>
            {isHi && (
              <circle
                cx={p.x}
                cy={p.y}
                r={18}
                fill="none"
                stroke="var(--team-primary)"
                strokeWidth={2}
                opacity={0.8}
              >
                <animate attributeName="r" from="10" to="24" dur="1.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.9" to="0" dur="1.6s" repeatCount="indefinite" />
              </circle>
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r={8 + density * 6}
              fill={color}
              opacity={0.85}
            />
            <text x={p.x} y={p.y - 14} textAnchor="middle" fill="white" fontSize={9} fontWeight={600}>
              {n.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
