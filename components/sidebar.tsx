"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  AlertTriangle,
  Flame,
  FileText,
  History,
  BookOpen,
  Settings,
  KeyRound,
  ShieldCheck,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "SOC Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Projects & Scans", href: "/projects", icon: FolderGit2 },
    { label: "Security Findings", href: "/findings", icon: AlertTriangle },
    { label: "Incidents (SOC)", href: "/incidents", icon: Flame },
    { label: "Executive Reports", href: "/reports", icon: FileText },
    { label: "Audit Logs", href: "/audit-logs", icon: History },
    { label: "API Keys & Ingest", href: "/settings?tab=api-keys", icon: KeyRound },
    { label: "Developer Docs", href: "/docs", icon: BookOpen },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-56 bg-[#090d16] border-r border-[#1e293b] flex flex-col justify-between shrink-0 h-[calc(100vh-3.5rem)] sticky top-14">
      {/* Primary Nav */}
      <div className="p-3 space-y-1">
        <div className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500">
          Security Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href.split("?")[0]));

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded text-xs font-medium transition-colors ${
                isActive
                  ? "bg-sky-950/60 text-sky-400 border border-sky-800/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer Info Box */}
      <div className="p-3 m-3 bg-[#020617] border border-[#1e293b] rounded text-xs space-y-1.5">
        <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Defensive Shield Active</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-tight">
          Safe passive posture checks & event correlation enabled.
        </p>
      </div>
    </aside>
  );
}
