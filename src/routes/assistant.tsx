import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { AppShell } from "@/components/AppShell";
import { useSimulationLoop } from "@/hooks/useSimulationLoop";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "Assistant · ArenaFlow Nexus" },
      {
        name: "description",
        content:
          "Full-screen conversation with the ArenaFlow AI stadium assistant — grounded in live node data.",
      },
    ],
  }),
  component: AssistantPage,
});

function AssistantPage() {
  const { t } = useTranslation();
  useSimulationLoop();

  return (
    <AppShell>
      <h1 className="text-3xl font-black text-white">{t("nav.assistant")}</h1>
      <p className="mt-1 text-sm text-white/60">
        Tap the floating chat button at the bottom-right to open the assistant.
        It reads the live stadium state and answers in your selected language.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          "Where is the shortest washroom queue?",
          "Which gate should I exit through?",
          "Is there a shorter food line upstairs?",
          "How busy is Gate A right now?",
          "Where is the nearest medical station?",
          "What's the heat index like?",
        ].map((s) => (
          <div
            key={s}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/80"
          >
            "{s}"
          </div>
        ))}
      </div>

      <div
        className="mt-10 rounded-3xl border border-white/10 p-6"
        style={{ background: "var(--team-gradient)", color: "var(--team-primary-contrast)" }}
      >
        <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">
          How this works
        </div>
        <p className="mt-2 max-w-2xl text-sm">
          Every question you ask is answered by an LLM that receives the full JSON
          snapshot of every live stadium node — gates, food, washrooms, medical,
          exits, parking — plus current weather and match state. Replies stay
          grounded in real numbers, in your chosen language.
        </p>
      </div>
    </AppShell>
  );
}
