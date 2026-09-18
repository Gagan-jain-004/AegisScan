"use client";

import React from "react";
import Link from "next/link";
import { Shield } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export function Navbar() {
  return (
    <header className="h-14 border-b border-[#1e293b] bg-[#090d16] px-4 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-sky-600 to-sky-800 flex items-center justify-center border border-sky-500/40 shadow-sm shadow-sky-950">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-white group-hover:text-sky-400 transition-colors">
                AegisScan
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-sky-950/80 border border-sky-800 text-sky-400">
                SOC v1.0
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Center Monitoring Status */}
      <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950/80 px-3 py-1 rounded border border-[#1e293b]">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span>DEFENSIVE TELEMETRY ACTIVE</span>
      </div>

      {/* Right User Actions */}
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="text-xs text-slate-400 hover:text-slate-200 border border-[#1e293b] hover:border-slate-700 px-2.5 py-1 rounded transition-colors hidden sm:block font-mono"
        >
          Landing Page
        </Link>

        {/* Clerk User Profile Button */}
        <div className="flex items-center">
          <UserButton />
        </div>
      </div>
    </header>
  );
}
