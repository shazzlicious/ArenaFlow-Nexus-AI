import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "google/gemini-3-flash-preview";

const NodeSnapshotSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  zone: z.string(),
  crowdDensity: z.number(),
  waitTimeMins: z.number(),
  tempC: z.number(),
  noiseDb: z.number(),
  volunteersAvailable: z.number(),
  occupancyPct: z.number().optional(),
  flowRate: z.number().optional(),
});

const PredictInput = z.object({
  nodes: z.array(NodeSnapshotSchema),
  weather: z
    .object({ tempC: z.number(), condition: z.string().optional() })
    .optional(),
  match: z
    .object({
      status: z.string(),
      minutesToKickoff: z.number().nullable(),
      home: z.string().optional(),
      away: z.string().optional(),
    })
    .optional(),
  language: z.string().default("en"),
});

function getKey() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return key;
}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1) throw new Error("No JSON in model output");
  return JSON.parse(raw.slice(firstBrace, lastBrace + 1));
}

export const predictOps = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PredictInput.parse(input))
  .handler(async ({ data }) => {
    const gateway = createLovableAiGatewayProvider(getKey());
    const system = `You are ArenaFlow, a stadium operations analyst for a FIFA World Cup 2026 venue.
You receive a JSON snapshot of live sensor nodes (gates, food, washrooms, medical, exits, parking) plus weather and match context.
Predict operational bottlenecks BEFORE they happen. Output STRICT JSON only, no prose, no markdown, matching:
{
  "summary": string,
  "alerts": [
    {
      "severity": "info" | "warn" | "critical",
      "node": string,
      "prediction": string,
      "recommendedAction": string,
      "etaMinutes": number
    }
  ]
}
Rules:
- Return 3-6 alerts, sorted by severity (critical first).
- Ground every alert in the numeric snapshot (cite density, wait time, or flow).
- Recommended actions should be concrete ops directives (redirect, dispatch, open, close).
- Respond in language code: ${data.language}.`;

    const prompt = JSON.stringify({
      nodes: data.nodes,
      weather: data.weather,
      match: data.match,
    });

    const { text } = await generateText({
      model: gateway(MODEL),
      system,
      prompt,
    });

    interface Alert {
      severity: "info" | "warn" | "critical";
      node: string;
      prediction: string;
      recommendedAction: string;
      etaMinutes: number;
    }
    try {
      const parsed = extractJson(text) as {
        summary?: string;
        alerts?: Array<Partial<Alert>>;
      };
      const alerts: Alert[] = (parsed.alerts ?? []).map((a) => ({
        severity: (a.severity as Alert["severity"]) ?? "info",
        node: String(a.node ?? ""),
        prediction: String(a.prediction ?? ""),
        recommendedAction: String(a.recommendedAction ?? ""),
        etaMinutes: Number(a.etaMinutes ?? 0),
      }));
      return { summary: parsed.summary ?? "", alerts };
    } catch (e) {
      console.error("predictOps parse failure", e, text);
      return { summary: "", alerts: [] as Array<Alert> };
    }
  });

const AssistInput = z.object({
  question: z.string().min(1).max(500),
  nodes: z.array(NodeSnapshotSchema),
  language: z.string().default("en"),
  team: z.string().optional(),
});

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AssistInput.parse(input))
  .handler(async ({ data }) => {
    const gateway = createLovableAiGatewayProvider(getKey());
    const system = `You are ArenaFlow Assistant, helping fans and staff inside a FIFA World Cup 2026 stadium.
You have a live JSON snapshot of stadium nodes with real-time density and wait times.
Use it to give SPECIFIC, current answers (e.g. name the shortest washroom queue, recommend the least-congested gate).
Keep replies under 4 sentences. Respond in language code: ${data.language}. Supporter's team: ${data.team ?? "not set"}.`;

    const { text } = await generateText({
      model: gateway(MODEL),
      system,
      prompt: `Live snapshot:\n${JSON.stringify(data.nodes)}\n\nQuestion: ${data.question}`,
    });
    return { reply: text.trim() };
  });
