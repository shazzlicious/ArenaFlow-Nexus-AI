import { useEffect } from "react";
import { useStadiumStore } from "@/store/useStadiumStore";
import { useWeather } from "@/hooks/useWeather";
import { useMatchContext, useMatches } from "@/hooks/useMatches";

/**
 * The heartbeat: runs the simulation tick every 4s, feeding in real
 * weather + real match schedule so pressures spike near kickoff/halftime.
 */
export function useSimulationLoop() {
  const tick = useStadiumStore((s) => s.tick);
  const weather = useWeather();
  const { matches } = useMatches();
  const matchCtx = useMatchContext(matches);

  useEffect(() => {
    const run = () => {
      tick({
        now: Date.now(),
        ambientTempC: weather?.tempC ?? 28,
        minutesToKickoff: matchCtx.minutesToKickoff,
        matchInProgress: matchCtx.matchInProgress,
        isHalftime: matchCtx.isHalftime,
      });
    };
    run();
    const id = setInterval(run, 4000);
    return () => clearInterval(id);
  }, [tick, weather?.tempC, matchCtx.minutesToKickoff, matchCtx.matchInProgress, matchCtx.isHalftime]);

  return { weather, matchCtx, matches };
}
