import { create } from "zustand";
import { INITIAL_NODES, StadiumNode, TickContext, stepNode } from "@/lib/stadium";

interface StadiumState {
  nodes: StadiumNode[];
  lastTick: number;
  tick: (ctx: TickContext) => void;
}

export const useStadiumStore = create<StadiumState>((set) => ({
  nodes: INITIAL_NODES,
  lastTick: Date.now(),
  tick: (ctx) =>
    set((s) => ({
      nodes: s.nodes.map((n) => stepNode(n, ctx)),
      lastTick: ctx.now,
    })),
}));
