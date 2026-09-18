import React from "react";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const s = (status || "").toUpperCase();

  const config: Record<string, { bg: string; border: string; text: string; label: string }> = {
    ACTIVE: {
      bg: "bg-[rgba(16,185,129,0.1)]",
      border: "border-[rgba(16,185,129,0.25)]",
      text: "text-emerald-400",
      label: "ACTIVE",
    },
    PAUSED: {
      bg: "bg-[rgba(234,179,8,0.1)]",
      border: "border-[rgba(234,179,8,0.25)]",
      text: "text-yellow-400",
      label: "PAUSED",
    },
    ARCHIVED: {
      bg: "bg-[rgba(100,116,139,0.1)]",
      border: "border-[rgba(100,116,139,0.25)]",
      text: "text-slate-400",
      label: "ARCHIVED",
    },
    OPEN: {
      bg: "bg-[rgba(244,63,94,0.1)]",
      border: "border-[rgba(244,63,94,0.25)]",
      text: "text-rose-400",
      label: "OPEN",
    },
    INVESTIGATING: {
      bg: "bg-[rgba(249,115,22,0.1)]",
      border: "border-[rgba(249,115,22,0.25)]",
      text: "text-orange-400",
      label: "INVESTIGATING",
    },
    RESOLVED: {
      bg: "bg-[rgba(16,185,129,0.1)]",
      border: "border-[rgba(16,185,129,0.25)]",
      text: "text-emerald-400",
      label: "RESOLVED",
    },
    FALSE_POSITIVE: {
      bg: "bg-[rgba(100,116,139,0.1)]",
      border: "border-[rgba(100,116,139,0.25)]",
      text: "text-slate-400",
      label: "FALSE POSITIVE",
    },
    ACKNOWLEDGED: {
      bg: "bg-[rgba(59,130,246,0.1)]",
      border: "border-[rgba(59,130,246,0.25)]",
      text: "text-blue-400",
      label: "ACKNOWLEDGED",
    },
    COMPLETED: {
      bg: "bg-[rgba(16,185,129,0.1)]",
      border: "border-[rgba(16,185,129,0.25)]",
      text: "text-emerald-400",
      label: "COMPLETED",
    },
    RUNNING: {
      bg: "bg-[rgba(2,132,199,0.1)]",
      border: "border-[rgba(2,132,199,0.25)]",
      text: "text-sky-400",
      label: "RUNNING",
    },
    FAILED: {
      bg: "bg-[rgba(244,63,94,0.1)]",
      border: "border-[rgba(244,63,94,0.25)]",
      text: "text-rose-400",
      label: "FAILED",
    },
  };

  const current = config[s] || {
    bg: "bg-slate-800/40",
    border: "border-slate-700",
    text: "text-slate-300",
    label: s,
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${current.bg} ${current.border} ${current.text}`}
    >
      {current.label}
    </span>
  );
}
