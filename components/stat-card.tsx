import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendType?: "positive" | "negative" | "neutral";
  color?: "sky" | "rose" | "orange" | "emerald" | "slate";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = "neutral",
  color = "sky",
}: StatCardProps) {
  const colorMap = {
    sky: "text-sky-400 border-sky-900/30 bg-sky-950/20",
    rose: "text-rose-400 border-rose-900/30 bg-rose-950/20",
    orange: "text-orange-400 border-orange-900/30 bg-orange-950/20",
    emerald: "text-emerald-400 border-emerald-900/30 bg-emerald-950/20",
    slate: "text-slate-400 border-slate-800 bg-slate-900/40",
  };

  return (
    <div className="bg-[#090d16] border border-[#1e293b] rounded-lg p-4 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</span>
        <div className={`p-1.5 rounded border ${colorMap[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl font-bold font-mono tracking-tight text-slate-100">{value}</div>
        {(subtitle || trend) && (
          <div className="flex items-center justify-between text-xs mt-1">
            {subtitle && <span className="text-slate-500">{subtitle}</span>}
            {trend && (
              <span
                className={`font-mono ${
                  trendType === "negative"
                    ? "text-rose-400"
                    : trendType === "positive"
                    ? "text-emerald-400"
                    : "text-slate-400"
                }`}
              >
                {trend}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
