"use client";

import type { HazardPrediction } from "@/lib/sim/engine";
import { motion } from "framer-motion";

function severityClass(sev: HazardPrediction["severity"]) {
  switch (sev) {
    case "high":
      return "text-rose-100 bg-rose-500/15 ring-rose-300/20";
    case "medium":
      return "text-amber-100 bg-amber-500/15 ring-amber-300/20";
    case "low":
    default:
      return "text-emerald-100 bg-emerald-500/15 ring-emerald-300/20";
  }
}

function barColor(sev: HazardPrediction["severity"]) {
  switch (sev) {
    case "high":
      return "bg-rose-400/70";
    case "medium":
      return "bg-amber-400/70";
    case "low":
    default:
      return "bg-emerald-400/70";
  }
}

export function RiskPanel({
  hazards,
}: {
  hazards: HazardPrediction[];
}) {
  const overall = Math.round(
    hazards.reduce((a, h) => a + h.probability, 0) / Math.max(1, hazards.length),
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-semibold text-white">
            AI Risk Prediction
          </div>
          <div className="mt-1 text-xs text-white/60">
            Probabilistic hazard outlook based on simulated satellite indices.
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-white/60">Overall risk score</div>
            <div className="text-2xl font-semibold text-white tabular-nums">
              {overall}%
            </div>
          </div>
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 rounded-full bg-white/10" />
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(rgba(34,211,238,0.75), rgba(52,211,153,0.75), rgba(239,68,68,0.75), rgba(34,211,238,0.75))",
                maskImage:
                  "radial-gradient(circle at 50% 50%, transparent 62%, black 64%)",
              }}
              initial={{ rotate: -90 }}
              animate={{ rotate: -90 + (overall / 100) * 360 }}
              transition={{ type: "spring", stiffness: 90, damping: 18 }}
            />
            <div className="absolute inset-2 rounded-full bg-black/40 backdrop-blur" />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {hazards.map((h) => (
          <div
            key={h.key}
            className="rounded-xl border border-white/10 bg-black/20 p-4"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold text-white">
                    {h.label}
                  </div>
                  <span
                    className={[
                      "rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                      severityClass(h.severity),
                    ].join(" ")}
                  >
                    {h.severity.toUpperCase()}
                  </span>
                </div>
                <div className="mt-1 text-xs text-white/60">{h.explanation}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-white/60">Probability</div>
                <div className="text-xl font-semibold text-white tabular-nums">
                  {h.probability}%
                </div>
              </div>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className={["h-full rounded-full", barColor(h.severity)].join(
                  " ",
                )}
                style={{ width: `${h.probability}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

