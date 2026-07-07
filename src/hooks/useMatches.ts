import { useEffect, useMemo, useState } from "react";

export interface Match {
  id: string;
  home: string;
  away: string;
  homeBadge?: string;
  awayBadge?: string;
  kickoffISO: string; // ISO datetime
  league: string;
  status: string;
  homeScore?: number | null;
  awayScore?: number | null;
}

const MATCH_DURATION_MIN = 105; // 90 + halftime buffer

// TheSportsDB free next-15 events endpoint. League id 4328 = English Premier League (as a reliable live
// stand-in until the 2026 FIFA WC fixtures are seeded). This gives us real, moving fixtures.
const URL = "https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=4328";

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(URL);
        const json = await res.json();
        if (cancelled) return;
        const events = (json.events ?? []) as Array<Record<string, string>>;
        setMatches(
          events.slice(0, 6).map((e) => ({
            id: e.idEvent,
            home: e.strHomeTeam,
            away: e.strAwayTeam,
            homeBadge: e.strHomeTeamBadge,
            awayBadge: e.strAwayTeamBadge,
            kickoffISO: `${e.dateEvent}T${e.strTime || "19:00:00"}Z`,
            league: e.strLeague,
            status: e.strStatus || "Scheduled",
            homeScore: e.intHomeScore ? Number(e.intHomeScore) : null,
            awayScore: e.intAwayScore ? Number(e.intAwayScore) : null,
          }))
        );
      } catch (e) {
        console.error("match fetch failed", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return { matches, loading };
}

export interface MatchContext {
  match: Match | null;
  minutesToKickoff: number | null;
  matchInProgress: boolean;
  isHalftime: boolean;
}

export function useMatchContext(matches: Match[]): MatchContext {
  return useMemo(() => {
    const now = Date.now();
    // Pick soonest match within a reasonable window
    const upcoming = [...matches]
      .filter((m) => {
        const k = new Date(m.kickoffISO).getTime();
        return k > now - MATCH_DURATION_MIN * 60_000;
      })
      .sort(
        (a, b) =>
          new Date(a.kickoffISO).getTime() - new Date(b.kickoffISO).getTime()
      );
    const m = upcoming[0] ?? null;
    if (!m) {
      return {
        match: null,
        minutesToKickoff: null,
        matchInProgress: false,
        isHalftime: false,
      };
    }
    const kickoff = new Date(m.kickoffISO).getTime();
    const minutesToKickoff = Math.round((kickoff - now) / 60_000);
    const elapsed = (now - kickoff) / 60_000;
    const matchInProgress = elapsed >= 0 && elapsed <= 100;
    const isHalftime = elapsed >= 45 && elapsed <= 60;
    return { match: m, minutesToKickoff, matchInProgress, isHalftime };
  }, [matches]);
}
