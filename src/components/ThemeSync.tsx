import { useAppStore } from "@/store/useAppStore";
import { getTeam } from "@/lib/teams";
import { useEffect } from "react";
import i18n from "@/lib/i18n";

/**
 * Applies the currently selected team's colors as CSS variables on <html>,
 * and syncs i18n language. This lets any component use var(--team-primary),
 * var(--team-accent), or the derived gradient without prop drilling.
 */
export function ThemeSync() {
  const teamCode = useAppStore((s) => s.teamCode);
  const language = useAppStore((s) => s.language);

  useEffect(() => {
    const team = getTeam(teamCode);
    const root = document.documentElement;
    root.style.setProperty("--team-primary", team.primary);
    root.style.setProperty("--team-accent", team.accent);
    root.style.setProperty(
      "--team-gradient",
      `linear-gradient(135deg, ${team.primary} 0%, ${team.accent} 100%)`
    );
    // Ensure enough contrast overlay for team primary buttons
    root.style.setProperty("--team-primary-contrast", pickContrast(team.primary));
  }, [teamCode]);

  useEffect(() => {
    i18n.changeLanguage(language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  return null;
}

function pickContrast(hex: string): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#0a0f1f" : "#ffffff";
}
