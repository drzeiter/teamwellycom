import { motion } from "framer-motion";
import { useState } from "react";

interface Metric {
  label: string;
  value: string;
  unit: string;
  trend: number[];
  color: string;
}

const METRICS: Metric[] = [
  { label: "HRV", value: "--", unit: "ms", trend: [42, 45, 48, 44, 38, 40, 43], color: "hsl(340, 75%, 55%)" },
  { label: "Heart Rate", value: "--", unit: "bpm", trend: [72, 70, 68, 74, 71, 69, 70], color: "hsl(0, 70%, 55%)" },
  { label: "Sleep", value: "--", unit: "hrs", trend: [7, 6.5, 7.2, 6.8, 7.5, 7, 6.9], color: "hsl(260, 60%, 55%)" },
  { label: "Steps", value: "--", unit: "", trend: [6000, 8200, 5400, 9100, 7300, 10200, 8500], color: "hsl(150, 60%, 45%)" },
  { label: "Strain", value: "--", unit: "", trend: [4, 6, 3, 7, 5, 8, 6], color: "hsl(45, 90%, 55%)" },
];

const MiniSparkline = ({ data, color }: { data: number[]; color: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 70 + 5},${32 - ((v - min) / range) * 24}`).join(" ");

  return (
    <svg width="80" height="36" viewBox="0 0 80 36" className="mt-1">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts} opacity="0.7" />
    </svg>
  );
};

const MetricsStrip = () => {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <div>
      <h2 className="font-display text-base font-bold text-foreground mb-1">Health Metrics</h2>
      <p className="text-xs text-muted-foreground mb-3">Connect a wearable for live data</p>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 no-scrollbar">
        {METRICS.map((m, i) => (
          <motion.button
            key={m.label}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
            className="glass rounded-2xl p-4 min-w-[130px] shrink-0 text-left hover:border-primary/20 transition-all active:scale-[0.97]"
          >
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{m.label}</p>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-2xl font-bold text-foreground">{m.value}</span>
              {m.unit && <span className="text-[10px] text-muted-foreground">{m.unit}</span>}
            </div>
            <MiniSparkline data={m.trend} color={m.color} />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default MetricsStrip;
