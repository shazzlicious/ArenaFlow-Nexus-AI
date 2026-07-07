import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useServerFn } from "@tanstack/react-start";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { askAssistant } from "@/lib/ai.functions";
import { useStadiumStore } from "@/store/useStadiumStore";
import { useAppStore } from "@/store/useAppStore";
import { getTeam } from "@/lib/teams";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

export function FloatingAssistant() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const ask = useServerFn(askAssistant);
  const nodes = useStadiumStore((s) => s.nodes);
  const language = useAppStore((s) => s.language);
  const teamCode = useAppStore((s) => s.teamCode);
  const team = getTeam(teamCode);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, loading]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: q }]);
    setLoading(true);
    try {
      const res = await ask({
        data: {
          question: q,
          nodes: nodes.map((n) => ({
            id: n.id,
            name: n.name,
            type: n.type,
            zone: n.zone,
            crowdDensity: Math.round(n.crowdDensity * 100) / 100,
            waitTimeMins: n.waitTimeMins,
            tempC: n.tempC,
            noiseDb: n.noiseDb,
            volunteersAvailable: n.volunteersAvailable,
            occupancyPct: n.occupancyPct,
            flowRate: n.flowRate,
          })),
          language,
          team: team.name,
        },
      });
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
    } catch (e) {
      console.error(e);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Sorry — assistant unavailable right now." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        aria-label="Open ArenaFlow assistant"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-transform hover:scale-110 focus:outline-none focus:ring-4"
        style={{
          background: "var(--team-gradient)",
          color: "var(--team-primary-contrast)",
          boxShadow: `0 10px 40px -10px ${team.primary}aa`,
        }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="ArenaFlow assistant"
          className="fixed bottom-24 right-6 z-50 flex h-[520px] w-[92vw] max-w-[380px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0a0f1f]/95 shadow-2xl backdrop-blur-xl"
        >
          <div
            className="flex items-center gap-3 border-b border-white/10 p-4"
            style={{ background: "var(--team-gradient)" }}
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
              style={{ backgroundColor: "#00000030" }}
            >
              {team.flag}
            </div>
            <div style={{ color: "var(--team-primary-contrast)" }}>
              <div className="text-sm font-bold">ArenaFlow AI</div>
              <div className="text-[10px] uppercase tracking-widest opacity-80">
                Live stadium brain
              </div>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="space-y-2 text-sm text-white/60">
                <p>Try:</p>
                <ul className="space-y-1 text-xs">
                  <li>· "Where's the shortest washroom queue right now?"</li>
                  <li>· "Which gate should I use to leave fastest?"</li>
                  <li>· "Is Gate A congested?"</li>
                </ul>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "ml-auto text-white"
                    : "bg-white/[0.06] text-white/90"
                }`}
                style={
                  m.role === "user"
                    ? { background: "var(--team-gradient)", color: "var(--team-primary-contrast)" }
                    : undefined
                }
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-white/50">
                <Loader2 size={12} className="animate-spin" />
                {t("thinking")}
              </div>
            )}
          </div>

          <form
            onSubmit={submit}
            className="flex items-center gap-2 border-t border-white/10 p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("askAnything")}
              aria-label={t("askAnything")}
              className="flex-1 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/30"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send"
              className="flex h-9 w-9 items-center justify-center rounded-full transition disabled:opacity-40"
              style={{ background: "var(--team-gradient)", color: "var(--team-primary-contrast)" }}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
