import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useServerFn } from "@tanstack/react-start";
import { predictOps } from "@/lib/ai.functions";
import { useStadiumStore } from "@/store/useStadiumStore";
import { useAppStore } from "@/store/useAppStore";
import { AlertTriangle, Sparkles, Loader2 } from "lucide-react";
import type { WeatherSnapshot } from "@/hooks/useWeather";
import type { MatchContext } from "@/hooks/useMatches";

interface Alert {
  severity: "info" | "warn" | "critical";
  node: string;
  prediction: string;
  recommendedAction: string;
  etaMinutes: number;
}

const sevMeta = {
  critical: { color: "#ef4444", label: "CRITICAL" },
  warn: { color: "#f59e0b", label: "WARNING" },
  info: { color: "#3b82f6", label: "INFO" },
};

export function PredictionsFeed({
  weather,
  matchCtx,
}: {
  weather: WeatherSnapshot | null;
  matchCtx: MatchContext;
}) {
  const { t } = useTranslation();
  const language = useAppStore((s) => s.language);
  const nodes = useStadiumStore((s) => s.nodes);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const busy = useRef(false);
  const predict = useServerFn(predictOps);

  // Serialize a compact node snapshot
  const snapshot = useMemo(
    () =>
      nodes.map((n) => ({
        id: n.id,
        name: n.name,
        type: n.type,
        zone: n.zone,
        crowdDensity: Math.round(n.crowdDensity * 100) / 100,
        waitTimeMins: n.waitTimeMins,
        tempC: n.tempC,
        noiseDb: n.noiseDb,
        volunteersAvailable: n.volunteersAvailable,
        occupancyPct: n.occupancyPct,
        flowRate: n.flowRate,
      })),
    [nodes]
  );

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (busy.current) return;
      busy.current = true;
      setLoading(true);
      try {
        const res = await predict({
          data: {
            nodes: snapshot,
            weather: weather ? { tempC: weather.tempC, condition: weather.condition } : undefined,
            match: matchCtx.match
              ? {
                  status: matchCtx.matchInProgress
                    ? matchCtx.isHalftime
                      ? "halftime"
                      : "in_progress"
                    : "scheduled",
                  minutesToKickoff: matchCtx.minutesToKickoff,
                  home: matchCtx.match.home,
                  away: matchCtx.match.away,
                }
              : undefined,
            language,
          },
        });
        if (!cancelled) {
          setAlerts((res.alerts ?? []) as Alert[]);
          setSummary(res.summary ?? "");
        }
      } catch (e) {
        console.error("predict failed", e);
      } finally {
        busy.current = false;
        if (!cancelled) setLoading(false);
      }
    }
    run();
    const id = setInterval(run, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
    // Deliberately not depending on `snapshot` — the interval reads fresh state via ref/state each tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, matchCtx.match?.id, matchCtx.matchInProgress, matchCtx.isHalftime]);

  return (
    <section
      aria-label={t("predictions")}
      className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-5"
    >
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} style={{ color: "var(--team-accent)" }} />
          <h2 className="text-lg font-bold text-white">{t("predictions")}</h2>
        </div>
        {loading && (
          <span className="flex items-center gap-1 text-xs text-white/50">
            <Loader2 size={12} className="animate-spin" />
            {t("thinking")}
          </span>
        )}
      </header>

      {summary && <p className="mt-3 text-sm text-white/60">{summary}</p>}

      <ul className="mt-4 space-y-3">
        {alerts.length === 0 && !loading && (
          <li className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-sm text-white/50">
            {t("noAlerts")}
          </li>
        )}
        {alerts.map((a, i) => {
          const meta = sevMeta[a.severity] ?? sevMeta.info;
          return (
            <li
              key={i}
              className="relative overflow-hidden rounded-xl border p-4"
              style={{ borderColor: `${meta.color}55`, backgroundColor: `${meta.color}0f` }}
            >
              <div
                className="absolute left-0 top-0 h-full w-1"
                style={{ backgroundColor: meta.color }}
                aria-hidden
              />
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} style={{ color: meta.color }} />
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: meta.color }}
                  >
                    {meta.label}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-white/40">
                    · {a.node}
                  </span>
                </div>
                <span className="text-xs text-white/50">ETA {a.etaMinutes}m</span>
              </div>
              <p className="mt-2 text-sm font-medium text-white">{a.prediction}</p>
              <p className="mt-1 text-xs text-white/60">→ {a.recommendedAction}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
