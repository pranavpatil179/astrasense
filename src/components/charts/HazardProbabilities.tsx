"use client";

import type { TrendPoint } from "@/lib/sim/engine";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function HazardProbabilities({ data }: { data: TrendPoint[] }) {
  const compact = data.map((d) => ({
    t: d.t.slice(5),
    flood: d.flood,
    drought: d.drought,
    veg: d.veg_stress,
  }));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <div className="flex items-baseline justify-between">
        <div className="text-sm font-semibold text-white">
          Hazard Probability (Trend)
        </div>
        <div className="text-xs text-white/50">Flood / Drought / Veg Stress</div>
      </div>

      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={compact}>
            <XAxis
              dataKey="t"
              tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(0,0,0,0.75)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12,
              }}
              labelStyle={{ color: "rgba(255,255,255,0.75)" }}
            />
            <Area
              type="monotone"
              dataKey="flood"
              stroke="rgba(34,211,238,0.8)"
              fill="rgba(34,211,238,0.18)"
              strokeWidth={2}
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="drought"
              stroke="rgba(251,191,36,0.85)"
              fill="rgba(251,191,36,0.16)"
              strokeWidth={2}
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="veg"
              stroke="rgba(239,68,68,0.75)"
              fill="rgba(239,68,68,0.14)"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

