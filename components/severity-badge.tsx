import React from "react";
import { Severity } from "@/lib/types";

interface SeverityBadgeProps {
  severity: Severity | string;
  size?: "sm" | "md";
}

export function SeverityBadge({ severity, size = "md" }: SeverityBadgeProps) {
  const sev = (severity || "INFO").toUpperCase();

  const config: Record<
    string,
    { dotColor: string; bg: string; border: string; text: string; label: string }
  > = {
    CRITICAL: {
      dotColor: "bg-[#f43f5e]",
      bg: "bg-[rgba(244,63,94,0.12)]",
      border: "border-[rgba(244,63,94,0.3)]",
      text: "text-rose-400",
      label: "CRITICAL",
    },
    HIGH: {
      dotColor: "bg-[#f97316]",
      bg: "bg-[rgba(249,115,22,0.12)]",
      border: "border-[rgba(249,115,22,0.3)]",
      text: "text-orange-400",
      label: "HIGH",
    },
    MEDIUM: {
      dotColor: "bg-[#eab308]",
      bg: "bg-[rgba(234,179,8,0.12)]",
      border: "border-[rgba(234,179,8,0.3)]",
      text: "text-yellow-400",
      label: "MEDIUM",
    },
    LOW: {
      dotColor: "bg-[#3b82f6]",
      bg: "bg-[rgba(59,130,246,0.12)]",
      border: "border-[rgba(59,130,246,0.3)]",
      text: "text-blue-400",
      label: "LOW",
    },
    INFO: {
      dotColor: "bg-[#64748b]",
      bg: "bg-[rgba(100,116,139,0.12)]",
      border: "border-[rgba(100,116,139,0.3)]",
      text: "text-slate-400",
      label: "INFO",
    },
  };

  const current = config[sev] || config.INFO;
  const sizeClasses = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded border ${current.bg} ${current.border} ${current.text} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dotColor} shrink-0 animate-pulse`} />
      {current.label}
    </span>
  );
}
