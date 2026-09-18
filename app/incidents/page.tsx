"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { SeverityBadge } from "@/components/severity-badge";
import { StatusBadge } from "@/components/status-badge";
import {
  Flame,
  Clock,
  ArrowRight,
  Search,
  Filter,
  ShieldAlert,
} from "lucide-react";
import { Incident } from "@/lib/types";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchIncidents = async () => {
    try {
      const res = await fetch("/api/incidents");
      const data = await res.json();
      setIncidents(data.incidents || []);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const filtered = incidents.filter((inc) => {
    if (statusFilter !== "ALL" && inc.status !== statusFilter) return false;
    if (severityFilter !== "ALL" && inc.severity !== severityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        inc.title.toLowerCase().includes(q) ||
        inc.incidentCode.toLowerCase().includes(q) ||
        (inc.sourceIp && inc.sourceIp.includes(q))
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-400" />
                <h1 className="text-xl font-bold tracking-tight text-slate-100">
                  Security Incidents & Threat Triage
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Correlated security events, brute-force anomalies, and suspicious activity flagged by the detection engine.
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-[#090d16] border border-[#1e293b] rounded-lg p-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 text-[10px] font-mono uppercase mb-1">Status Filter</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#020617] border border-[#1e293b] rounded px-2.5 py-1.5 text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Incidents</option>
                <option value="OPEN">Open</option>
                <option value="INVESTIGATING">Investigating</option>
                <option value="RESOLVED">Resolved</option>
                <option value="FALSE_POSITIVE">False Positive</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 text-[10px] font-mono uppercase mb-1">Severity</label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full bg-[#020617] border border-[#1e293b] rounded px-2.5 py-1.5 text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 text-[10px] font-mono uppercase mb-1">Search Incidents</label>
              <input
                type="text"
                placeholder="Search code, title, IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#020617] border border-[#1e293b] rounded px-2.5 py-1.5 text-slate-300 focus:outline-none font-mono text-xs"
              />
            </div>
          </div>

          {/* Incidents Table */}
          {filtered.length === 0 ? (
            <div className="p-12 bg-[#090d16] border border-[#1e293b] rounded-lg text-center text-xs text-slate-500 font-mono">
              No incidents matching current criteria.
            </div>
          ) : (
            <div className="bg-[#090d16] border border-[#1e293b] rounded-lg divide-y divide-[#1e293b]">
              {filtered.map((inc) => (
                <Link
                  key={inc.id}
                  href={`/incidents/${inc.id}`}
                  className="p-4 block hover:bg-slate-900/60 transition-colors space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-sky-400">{inc.incidentCode}</span>
                      <SeverityBadge severity={inc.severity} />
                      <StatusBadge status={inc.status} />
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(inc.lastSeen).toLocaleString()}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-[#1e293b] text-slate-300">
                        {inc.eventCount} Events
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-100">{inc.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{inc.description}</p>

                  <div className="text-[11px] font-mono text-slate-500 flex items-center gap-3">
                    <span>Source IP: <code className="text-slate-300">{inc.sourceIp || "N/A"}</code></span>
                    <span>•</span>
                    <span>Scope: {inc.projectName || inc.projectId}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
