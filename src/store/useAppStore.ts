import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_TEAM } from "@/lib/teams";

export type Language = "en" | "hi" | "es" | "fr" | "ar";

interface AppState {
  teamCode: string;
  language: Language;
  setTeam: (code: string) => void;
  setLanguage: (l: Language) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      teamCode: DEFAULT_TEAM.code,
      language: "en",
      setTeam: (code) => set({ teamCode: code }),
      setLanguage: (l) => set({ language: l }),
    }),
    { name: "arenaflow-prefs" }
  )
);
