import { Link, useLocation } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/store/useAppStore";
import { getTeam } from "@/lib/teams";
import { LayoutDashboard, Compass, User, Bot } from "lucide-react";
import type { ReactNode } from "react";

const links = [
  { to: "/", key: "dashboard", icon: LayoutDashboard },
  { to: "/navigation", key: "navigation", icon: Compass },
  { to: "/preferences", key: "preferences", icon: User },
  { to: "/assistant", key: "assistant", icon: Bot },
] as const;

export function TopBar() {
  const { t } = useTranslation();
  const loc = useLocation();
  const teamCode = useAppStore((s) => s.teamCode);
  const team = getTeam(teamCode);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050914]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-lg font-black"
            style={{ background: "var(--team-gradient)", color: "var(--team-primary-contrast)" }}
            aria-hidden
          >
            AF
          </div>
          <div>
            <div className="text-sm font-bold leading-tight text-white">
              {t("appName")}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-white/40">
              FIFA World Cup 2026
            </div>
          </div>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Primary">
          {links.map(({ to, key, icon: Icon }) => {
            const active = loc.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition"
                style={{
                  color: active ? "var(--team-primary-contrast)" : "rgba(255,255,255,0.7)",
                  background: active ? "var(--team-gradient)" : "transparent",
                }}
              >
                <Icon size={13} />
                {t(`nav.${key}`)}
              </Link>
            );
          })}
        </nav>

        <div
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1"
          aria-label={`Selected team: ${team.name}`}
        >
          <span aria-hidden>{team.flag}</span>
          <span className="text-xs font-semibold text-white/90">{team.name}</span>
        </div>
      </div>
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-white/5 px-3 py-2 md:hidden" aria-label="Primary mobile">
        {links.map(({ to, key, icon: Icon }) => {
          const active = loc.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className="flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs"
              style={{
                color: active ? "var(--team-primary-contrast)" : "rgba(255,255,255,0.7)",
                background: active ? "var(--team-gradient)" : "transparent",
              }}
            >
              <Icon size={12} />
              {t(`nav.${key}`)}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#050914] text-white">
      <TopBar />
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6">{children}</main>
    </div>
  );
}
