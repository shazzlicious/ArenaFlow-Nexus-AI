import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { AppShell } from "@/components/AppShell";
import { TEAMS, getTeam } from "@/lib/teams";
import { useAppStore, type Language } from "@/store/useAppStore";
import { useMemo, useState } from "react";
import { Search, Check } from "lucide-react";

const LANGS: Array<{ code: Language; label: string; native: string }> = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "fr", label: "French", native: "Français" },
  { code: "ar", label: "Arabic", native: "العربية" },
];

export const Route = createFileRoute("/preferences")({
  head: () => ({
    meta: [
      { title: "Team & Preferences · ArenaFlow Nexus" },
      {
        name: "description",
        content: "Choose your national team, preview dynamic theming, and switch languages.",
      },
    ],
  }),
  component: PreferencesPage,
});

function PreferencesPage() {
  const { t } = useTranslation();
  const teamCode = useAppStore((s) => s.teamCode);
  const setTeam = useAppStore((s) => s.setTeam);
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const [q, setQ] = useState("");
  const team = getTeam(teamCode);

  const filtered = useMemo(
    () =>
      TEAMS.filter((t) => t.name.toLowerCase().includes(q.toLowerCase())).sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    [q]
  );

  return (
    <AppShell>
      <h1 className="text-3xl font-black text-white">{t("nav.preferences")}</h1>
      <p className="mt-1 text-sm text-white/60">
        Personalize the digital twin. Colors and language repaint instantly.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-white/50">
            {t("chooseTeam")}
          </h2>

          <label className="relative block">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
              aria-hidden
            />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search teams…"
              aria-label="Search teams"
              className="w-full rounded-full border border-white/10 bg-white/[0.04] py-2.5 pl-9 pr-4 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/30"
            />
          </label>

          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {filtered.map((tm) => {
              const active = tm.code === teamCode;
              return (
                <li key={tm.code}>
                  <button
                    onClick={() => setTeam(tm.code)}
                    aria-pressed={active}
                    className="flex w-full items-center gap-3 rounded-xl border p-3 text-left transition"
                    style={{
                      borderColor: active ? tm.primary : "rgba(255,255,255,0.1)",
                      background: active
                        ? `linear-gradient(135deg, ${tm.primary}33, ${tm.accent}22)`
                        : "rgba(255,255,255,0.02)",
                    }}
                  >
                    <span className="text-2xl" aria-hidden>
                      {tm.flag}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-white">
                        {tm.name}
                      </div>
                      <div className="flex gap-1">
                        <span
                          className="h-2 w-6 rounded-full"
                          style={{ background: tm.primary }}
                          aria-hidden
                        />
                        <span
                          className="h-2 w-6 rounded-full"
                          style={{ background: tm.accent }}
                          aria-hidden
                        />
                      </div>
                    </div>
                    {active && <Check size={16} className="text-white" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <aside className="space-y-6">
          <div
            className="overflow-hidden rounded-3xl border border-white/10 p-6"
            style={{ background: "var(--team-gradient)", color: "var(--team-primary-contrast)" }}
          >
            <div className="text-[10px] uppercase tracking-widest opacity-80">
              Live theme preview
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="text-5xl">{team.flag}</div>
              <div>
                <div className="text-xl font-black">{team.name}</div>
                <div className="text-[11px] uppercase tracking-widest opacity-70">
                  {team.primary} · {team.accent}
                </div>
              </div>
            </div>
            <button
              className="mt-6 rounded-full bg-black/25 px-4 py-2 text-sm font-semibold"
              onClick={() => {
                if ("Notification" in window) {
                  Notification.requestPermission();
                }
              }}
            >
              Enable match notifications
            </button>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-white/50">
              {t("language")}
            </h2>
            <ul className="space-y-1">
              {LANGS.map((l) => {
                const active = l.code === language;
                return (
                  <li key={l.code}>
                    <button
                      onClick={() => setLanguage(l.code)}
                      aria-pressed={active}
                      className="flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-left text-sm transition"
                      style={{
                        borderColor: active ? "var(--team-primary)" : "rgba(255,255,255,0.1)",
                        background: active ? "rgba(255,255,255,0.04)" : "transparent",
                      }}
                    >
                      <span className="text-white">
                        {l.native}
                        <span className="ml-2 text-xs text-white/40">{l.label}</span>
                      </span>
                      {active && <Check size={14} className="text-white" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
