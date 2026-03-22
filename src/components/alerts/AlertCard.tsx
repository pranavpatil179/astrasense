"use client";

import type { AlertItem } from "@/lib/sim/engine";
import { motion } from "framer-motion";

function badge(sev: AlertItem["severity"]) {
  switch (sev) {
    case "critical":
      return "bg-rose-500/15 text-rose-100 ring-rose-300/20";
    case "warning":
      return "bg-amber-500/15 text-amber-100 ring-amber-300/20";
    case "info":
    default:
      return "bg-cyan-500/15 text-cyan-100 ring-cyan-300/20";
  }
}

export function AlertCard({ alert }: { alert: AlertItem }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-white">
            {alert.title}
          </div>
          <div className="mt-1 text-xs text-white/60">{alert.message}</div>
        </div>
        <span
          className={[
            "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
            badge(alert.severity),
          ].join(" ")}
        >
          {alert.severity.toUpperCase()}
        </span>
      </div>
      <div className="mt-4 text-xs text-white/40">
        {new Date(alert.createdAt).toLocaleString()}
      </div>
    </motion.div>
  );
}

