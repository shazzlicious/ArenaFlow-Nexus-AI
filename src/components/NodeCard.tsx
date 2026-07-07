import { StadiumNode, nodeSeverity } from "@/lib/stadium";
import { useTranslation } from "react-i18next";
import { Users, Clock, Thermometer, Volume2, HandHelping, Car } from "lucide-react";

const typeIcon: Record<string, string> = {
  gate: "🚪",
  food: "🍔",
  washroom: "🚻",
  medical: "➕",
  exit: "↗",
  parking: "🅿",
};

export function NodeCard({ node }: { node: StadiumNode }) {
  const { t } = useTranslation();
  const sev = nodeSeverity(node);
  const sevColor = sev === "critical" ? "#ef4444" : sev === "warn" ? "#f59e0b" : "#22c55e";
  const density = Math.round(node.crowdDensity * 100);

  const spark = node.history.slice(-24);
  const max = Math.max(...spark.map((p) => p.density), 0.001);
  const w = 120;
  const h = 28;
  const path = spark
    .map((p, i) => {
      const x = (i / Math.max(1, spark.length - 1)) * w;
      const y = h - (p.density / max) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm transition-colors hover:bg-white/[0.06]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-lg font-semibold text-white">
            <span aria-hidden>{typeIcon[node.type]}</span>
            {node.name}
          </div>
          <div className="text-xs uppercase tracking-wider text-white/40">
            {node.zone} · {node.type}
          </div>
        </div>
        <div
          className="flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider"
          style={{ backgroundColor: `${sevColor}22`, color: sevColor }}
        >
          <span
            className="h-1.5 w-1.5 animate-pulse rounded-full"
            style={{ backgroundColor: sevColor }}
          />
          {t(`severity.${sev}`)}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Metric icon={<Users size={14} />} label={t("density")} value={`${density}%`} accent={sevColor} />
        <Metric
          icon={<Clock size={14} />}
          label={t("wait")}
          value={`${node.waitTimeMins} ${t("mins")}`}
        />
        <Metric icon={<Thermometer size={14} />} label="Temp" value={`${node.tempC.toFixed(0)}°C`} />
        <Metric icon={<Volume2 size={14} />} label="Noise" value={`${node.noiseDb} dB`} />
        <Metric
          icon={<HandHelping size={14} />}
          label="Staff"
          value={node.volunteersAvailable.toString()}
        />
        {node.type === "parking" && (
          <Metric icon={<Car size={14} />} label="Occup." value={`${node.occupancyPct}%`} />
        )}
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${density}%`, backgroundColor: sevColor }}
        />
      </div>

      {spark.length > 1 && (
        <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 h-7 w-full opacity-70">
          <path d={path} fill="none" stroke={sevColor} strokeWidth={1.5} />
        </svg>
      )}
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-white/40">
        {icon}
        {label}
      </div>
      <div className="text-sm font-semibold" style={{ color: accent ?? "white" }}>
        {value}
      </div>
    </div>
  );
}
