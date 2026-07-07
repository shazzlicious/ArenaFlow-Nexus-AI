export type NodeType =
  | "gate"
  | "food"
  | "washroom"
  | "medical"
  | "exit"
  | "parking";

export interface StadiumNode {
  id: string;
  name: string;
  type: NodeType;
  zone: string;
  // Live metrics
  crowdDensity: number; // 0..1
  waitTimeMins: number;
  tempC: number;
  noiseDb: number;
  volunteersAvailable: number;
  occupancyPct?: number; // for parking
  flowRate?: number; // people/min for exits/gates
  lastUpdated: number;
  history: Array<{ t: number; density: number; wait: number }>;
}

export const INITIAL_NODES: StadiumNode[] = [
  { id: "gate-a", name: "Gate A", type: "gate", zone: "North" },
  { id: "gate-b", name: "Gate B", type: "gate", zone: "East" },
  { id: "gate-c", name: "Gate C", type: "gate", zone: "West" },
  { id: "food-1", name: "Food Court · Level 1", type: "food", zone: "Concourse" },
  { id: "food-2", name: "Food Court · Level 2", type: "food", zone: "Upper" },
  { id: "wc-north", name: "Washrooms · North", type: "washroom", zone: "North" },
  { id: "wc-south", name: "Washrooms · South", type: "washroom", zone: "South" },
  { id: "med-1", name: "Medical Station · A", type: "medical", zone: "North" },
  { id: "med-2", name: "Medical Station · B", type: "medical", zone: "South" },
  { id: "exit-main", name: "Main Exit", type: "exit", zone: "South" },
  { id: "parking-1", name: "Parking · Lot 1", type: "parking", zone: "West" },
].map((n) => ({
  ...n,
  crowdDensity: 0.25 + Math.random() * 0.2,
  waitTimeMins: n.type === "medical" ? 0 : Math.round(2 + Math.random() * 5),
  tempC: 28,
  noiseDb: 60 + Math.random() * 15,
  volunteersAvailable: 2 + Math.floor(Math.random() * 4),
  occupancyPct: n.type === "parking" ? Math.round(30 + Math.random() * 30) : undefined,
  flowRate: n.type === "gate" || n.type === "exit" ? Math.round(20 + Math.random() * 40) : undefined,
  lastUpdated: Date.now(),
  history: [] as Array<{ t: number; density: number; wait: number }>,
})) as StadiumNode[];

export const HISTORY_LEN = 40;

// Bounded random walk
export function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export interface TickContext {
  now: number;
  ambientTempC: number;
  minutesToKickoff: number | null; // negative if in-match; null if no match
  matchInProgress: boolean;
  isHalftime: boolean;
}

/**
 * Advance a single node one simulation tick.
 * Pure function — deterministic given rng.
 */
export function stepNode(
  node: StadiumNode,
  ctx: TickContext,
  rng: () => number = Math.random
): StadiumNode {
  const hour = new Date(ctx.now).getHours();
  const mealTime = (hour >= 11 && hour <= 14) || (hour >= 18 && hour <= 21);

  // Base drift
  let density = node.crowdDensity + (rng() - 0.5) * 0.06;
  let wait = node.waitTimeMins + (rng() - 0.5) * 1.2;

  // Match-driven pressure
  const preKickoffWindow =
    ctx.minutesToKickoff !== null &&
    ctx.minutesToKickoff > 0 &&
    ctx.minutesToKickoff < 90;
  if (preKickoffWindow && (node.type === "gate" || node.type === "parking")) {
    const intensity = 1 - ctx.minutesToKickoff! / 90; // 0..1
    density += intensity * 0.05;
    wait += intensity * 1.5;
  }
  if (ctx.isHalftime && (node.type === "food" || node.type === "washroom")) {
    density += 0.08;
    wait += 2;
  }
  if (ctx.matchInProgress && node.type === "gate") {
    density -= 0.04; // stands full, gates quiet
  }

  // Meal-time patterns
  if (mealTime && node.type === "food") {
    density += 0.03;
    wait += 0.6;
  }

  // Temperature drives heat-related stress
  const heat = ctx.ambientTempC;
  if (heat > 32 && (node.type === "medical" || node.type === "washroom")) {
    density += 0.02;
  }

  density = clamp(density, 0, 1);
  wait = clamp(wait, 0, 45);

  const noise = clamp(
    node.noiseDb + (rng() - 0.5) * 3 + (ctx.matchInProgress ? 0.5 : 0),
    45,
    115
  );
  const volunteers = clamp(
    node.volunteersAvailable + (rng() > 0.9 ? (rng() > 0.5 ? 1 : -1) : 0),
    0,
    8
  );

  const occupancyPct =
    node.type === "parking"
      ? clamp(
          (node.occupancyPct ?? 40) +
            (preKickoffWindow ? 1.5 : ctx.matchInProgress ? 0 : -0.5) +
            (rng() - 0.5),
          0,
          100
        )
      : undefined;

  const flowRate =
    node.type === "gate" || node.type === "exit"
      ? clamp((node.flowRate ?? 30) + (rng() - 0.5) * 6, 0, 120)
      : undefined;

  const nextHistory = [
    ...node.history,
    { t: ctx.now, density, wait },
  ].slice(-HISTORY_LEN);

  return {
    ...node,
    crowdDensity: density,
    waitTimeMins: Math.round(wait * 10) / 10,
    tempC: heat,
    noiseDb: Math.round(noise),
    volunteersAvailable: volunteers,
    occupancyPct: occupancyPct !== undefined ? Math.round(occupancyPct) : undefined,
    flowRate: flowRate !== undefined ? Math.round(flowRate) : undefined,
    lastUpdated: ctx.now,
    history: nextHistory,
  };
}

export function nodeSeverity(node: StadiumNode): "ok" | "warn" | "critical" {
  if (node.crowdDensity > 0.85 || node.waitTimeMins > 20) return "critical";
  if (node.crowdDensity > 0.65 || node.waitTimeMins > 10) return "warn";
  return "ok";
}
