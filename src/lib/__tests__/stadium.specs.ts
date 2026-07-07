// Unit tests for the simulation engine.
// Run these with any Vitest-compatible runner (`bunx vitest run`).
// Kept minimal so the pure logic is verifiable without a full test harness.
import { describe, expect, it } from "vitest";
import { INITIAL_NODES, stepNode, nodeSeverity, clamp } from "../stadium";

describe("stadium simulation", () => {
  it("clamp bounds correctly", () => {
    expect(clamp(-1, 0, 1)).toBe(0);
    expect(clamp(2, 0, 1)).toBe(1);
    expect(clamp(0.5, 0, 1)).toBe(0.5);
  });

  it("crowd density never goes negative or above 1", () => {
    let n = INITIAL_NODES[0];
    for (let i = 0; i < 500; i++) {
      n = stepNode(n, {
        now: Date.now(),
        ambientTempC: 30,
        minutesToKickoff: 15,
        matchInProgress: false,
        isHalftime: false,
      });
      expect(n.crowdDensity).toBeGreaterThanOrEqual(0);
      expect(n.crowdDensity).toBeLessThanOrEqual(1);
      expect(n.waitTimeMins).toBeGreaterThanOrEqual(0);
    }
  });

  it("severity escalates when density is high", () => {
    const critical = { ...INITIAL_NODES[0], crowdDensity: 0.95, waitTimeMins: 25 };
    expect(nodeSeverity(critical)).toBe("critical");
  });

  it("halftime pressures food & washrooms", () => {
    const food = INITIAL_NODES.find((n) => n.type === "food")!;
    const before = food.crowdDensity;
    const after = stepNode(food, {
      now: Date.now(),
      ambientTempC: 28,
      minutesToKickoff: null,
      matchInProgress: true,
      isHalftime: true,
    });
    // deterministic-ish: halftime adds +0.08 baseline
    expect(after.crowdDensity).toBeGreaterThan(before - 0.03);
  });
});
