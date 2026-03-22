"use client";

import type { TrendPoint } from "@/lib/sim/engine";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function IndexTrends({ data }: { data: TrendPoint[] }) {
  const compact = data.map((d) => ({
    t: d.t.slice(5),
    ndvi: d.ndvi,
    ndwi: d.ndwi,
    evi: d.evi,
  }));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <div className="flex items-baseline justify-between">
        <div className="text-sm font-semibold text-white">
          Environmental Index Trends
        </div>
        <div className="text-xs text-white/50">NDVI / NDWI / EVI</div>
      </div>

      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={compact}>
            <XAxis
              dataKey="t"
              tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 1]}
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
            <Line
              type="monotone"
              dataKey="ndvi"
              stroke="rgba(52,211,153,0.9)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="ndwi"
              stroke="rgba(34,211,238,0.9)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="evi"
              stroke="rgba(167,139,250,0.9)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

