import { useTranslation } from "react-i18next";
import type { Match, MatchContext } from "@/hooks/useMatches";
import { useAppStore } from "@/store/useAppStore";
import { getTeam } from "@/lib/teams";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")}`;
}

export function MatchCard({
  matchCtx,
  matches,
}: {
  matchCtx: MatchContext;
  matches: Match[];
}) {
  const { t } = useTranslation();
  const teamCode = useAppStore((s) => s.teamCode);
  const team = getTeam(teamCode);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, []);
  void tick;

  const m = matchCtx.match;

  // Fire a toast when the user's team is about to play.
  useEffect(() => {
    const teamMatch = matches.find(
      (mm) =>
        mm.home.toLowerCase().includes(team.name.toLowerCase()) ||
        mm.away.toLowerCase().includes(team.name.toLowerCase())
    );
    if (!teamMatch) return;
    const mins = Math.round((new Date(teamMatch.kickoffISO).getTime() - Date.now()) / 60000);
    if (mins > 0 && mins <= 60) {
      toast(`${team.flag} ${team.name} kicks off in ${mins} min`, {
        description: `${teamMatch.home} vs ${teamMatch.away}`,
      });
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification(`${team.name} match starting soon`, {
            body: `${teamMatch.home} vs ${teamMatch.away} — kickoff in ${mins} min`,
          });
        }
      }
    }
    // Only re-run when match list identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches.map((mm) => mm.id).join(","), teamCode]);

  if (!m) return null;
  const kickoff = new Date(m.kickoffISO).getTime();
  const diff = kickoff - Date.now();

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-white/10 p-5"
      style={{ background: "var(--team-gradient)", color: "var(--team-primary-contrast)" }}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">
            {matchCtx.matchInProgress
              ? matchCtx.isHalftime
                ? t("halftime")
                : t("matchLive")
              : t("nextMatch")}
          </div>
          <div className="mt-1 text-lg font-black leading-tight">
            {m.home} <span className="opacity-60">vs</span> {m.away}
          </div>
          <div className="mt-0.5 text-[11px] opacity-70">{m.league}</div>
        </div>
        <div className="text-right">
          {matchCtx.matchInProgress ? (
            <div className="rounded-full bg-black/30 px-3 py-1 text-xs font-bold">
              {t("live")}
            </div>
          ) : (
            <div className="font-mono text-2xl font-black tabular-nums">
              {formatCountdown(diff)}
            </div>
          )}
        </div>
      </div>
      <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" aria-hidden />
    </div>
  );
}
