"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { StatCard } from "@/components/stat-card";
import { SeverityBadge } from "@/components/severity-badge";
import { StatusBadge } from "@/components/status-badge";
import { TargetCheckModal } from "@/components/target-check-modal";
import {
  FolderGit2,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Activity,
  Plus,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  Sparkles,
  Search,
} from "lucide-react";
import { Project, Finding, Incident, SecurityEvent, Assessment } from "@/lib/types";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projRes, findRes, incRes, evtRes, asmRes] = await Promise.all([
        fetch("/api/projects").then((r) => r.json()),
        fetch("/api/findings").then((r) => r.json()),
        fetch("/api/incidents").then((r) => r.json()),
        fetch("/api/security-events").then((r) => r.json()),
        fetch("/api/assessments").then((r) => r.json()),
      ]);

      setProjects(projRes.projects || []);
      setFindings(findRes.findings || []);
      setIncidents(incRes.incidents || []);
      setEvents(evtRes.events || []);
      setAssessments(asmRes.assessments || []);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Aggregated Stats
  const activeIncidents = incidents.filter((i) => i.status === "OPEN" || i.status === "INVESTIGATING");
  const openFindings = findings.filter((f) => f.status === "OPEN");
  const criticalFindings = findings.filter((f) => f.severity === "CRITICAL" && f.status === "OPEN");

  const completedScansWithScore = assessments.filter((a) => a.securityScore !== null && a.securityScore !== undefined);
  const averageScore = completedScansWithScore.length > 0
    ? Math.round(
        completedScansWithScore.reduce((acc, a) => acc + (a.securityScore || 0), 0) /
          completedScansWithScore.length
      )
    : "--";

  const severityCounts = {
    CRITICAL: findings.filter((f) => f.severity === "CRITICAL").length,
    HIGH: findings.filter((f) => f.severity === "HIGH").length,
    MEDIUM: findings.filter((f) => f.severity === "MEDIUM").length,
    LOW: findings.filter((f) => f.severity === "LOW").length,
    INFO: findings.filter((f) => f.severity === "INFO").length,
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 max-w-7xl">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-5">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-100">
                  Security Operations Center (SOC)
                </h1>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/60 text-emerald-400">
                  MONITORING ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Real-time defensive posture assessment and security telemetry overview.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-3.5 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Register Application
              </button>
            </div>
          </div>

          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard
              title="Applications"
              value={projects.length}
              subtitle="Registered Scope"
              icon={FolderGit2}
              color="sky"
            />
            <StatCard
              title="Avg Security Score"
              value={averageScore === "--" ? "--" : `${averageScore}/100`}
              subtitle="Weighted Posture"
              icon={ShieldCheck}
              color="emerald"
            />
            <StatCard
              title="Open Findings"
              value={openFindings.length}
              subtitle="Across All Projects"
              icon={AlertTriangle}
              color="orange"
            />
            <StatCard
              title="Active Incidents"
              value={activeIncidents.length}
              subtitle="Requires Triage"
              icon={Flame}
              color="rose"
            />
            <StatCard
              title="Security Events"
              value={events.length}
              subtitle="Total Ingested"
              icon={Activity}
              color="slate"
            />
            <StatCard
              title="Critical Risks"
              value={criticalFindings.length}
              subtitle="Urgent Fixes"
              icon={ShieldAlert}
              color="rose"
            />
          </div>

          {/* Clean State Quick-Start Banner if no projects */}
          {projects.length === 0 && !loading && (
            <div className="p-6 bg-[#090d16] border border-dashed border-sky-800/60 rounded-lg text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-sky-950/80 border border-sky-800 flex items-center justify-center text-sky-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-sm font-semibold text-slate-200">Fresh AegisScan Workspace Initialized</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No applications registered yet. Register an authorized target web application to run safe security posture scans or generate an API key to stream live security telemetry.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Register First Target
                </button>
                <Link
                  href="/docs"
                  className="px-4 py-2 rounded bg-slate-900 hover:bg-slate-800 border border-[#1e293b] text-slate-300 text-xs font-medium flex items-center gap-1.5"
                >
                  View SDK Documentation
                </Link>
              </div>
            </div>
          )}

          {/* Two-Column Middle Grid: Severity Distribution & Active Incidents */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Severity Distribution Panel */}
            <div className="bg-[#090d16] border border-[#1e293b] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#1e293b] pb-2.5">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Findings Severity Breakdown
                </h2>
                <span className="text-[11px] font-mono text-slate-400">{findings.length} Total</span>
              </div>

              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-slate-300">Critical</span>
                  </div>
                  <span className="font-semibold text-rose-400">{severityCounts.CRITICAL}</span>
                </div>
                <div className="w-full bg-[#020617] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full"
                    style={{ width: `${findings.length ? (severityCounts.CRITICAL / findings.length) * 100 : 0}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-mono pt-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    <span className="text-slate-300">High</span>
                  </div>
                  <span className="font-semibold text-orange-400">{severityCounts.HIGH}</span>
                </div>
                <div className="w-full bg-[#020617] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-500 h-full rounded-full"
                    style={{ width: `${findings.length ? (severityCounts.HIGH / findings.length) * 100 : 0}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-mono pt-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span className="text-slate-300">Medium</span>
                  </div>
                  <span className="font-semibold text-yellow-400">{severityCounts.MEDIUM}</span>
                </div>
                <div className="w-full bg-[#020617] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-yellow-500 h-full rounded-full"
                    style={{ width: `${findings.length ? (severityCounts.MEDIUM / findings.length) * 100 : 0}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-mono pt-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-slate-300">Low & Info</span>
                  </div>
                  <span className="font-semibold text-blue-400">{severityCounts.LOW + severityCounts.INFO}</span>
                </div>
                <div className="w-full bg-[#020617] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{ width: `${findings.length ? ((severityCounts.LOW + severityCounts.INFO) / findings.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Recent Incidents Panel */}
            <div className="lg:col-span-2 bg-[#090d16] border border-[#1e293b] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#1e293b] pb-2.5">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Active SOC Incidents & Threats
                  </h2>
                </div>
                <Link href="/incidents" className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1">
                  View All Incidents <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>

              {incidents.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 font-mono">
                  No active incidents detected. Telemetry streams are operating normally.
                </div>
              ) : (
                <div className="divide-y divide-[#1e293b]">
                  {incidents.slice(0, 4).map((inc) => (
                    <Link
                      key={inc.id}
                      href={`/incidents/${inc.id}`}
                      className="block py-2.5 hover:bg-slate-900/50 rounded px-2 -mx-2 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-semibold text-sky-400">
                            {inc.incidentCode}
                          </span>
                          <SeverityBadge severity={inc.severity} size="sm" />
                          <StatusBadge status={inc.status} />
                        </div>
                        <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(inc.lastSeen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-200 mt-1 truncate">{inc.title}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-1 font-mono">
                        <span>Source: {inc.sourceIp || "N/A"}</span>
                        <span>•</span>
                        <span>{inc.eventCount} Correlated Events</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Table: Recent Findings */}
          <div className="bg-[#090d16] border border-[#1e293b] rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-2.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Recent Security Findings
                </h2>
              </div>
              <Link href="/findings" className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1">
                View All Findings <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            {findings.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 font-mono">
                No findings reported yet. Run an assessment against a registered application to discover posture items.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] font-mono text-slate-400 uppercase bg-[#020617] border-b border-[#1e293b]">
                    <tr>
                      <th className="py-2 px-3">Severity</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3">Title</th>
                      <th className="py-2 px-3">Project</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">Discovered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e293b]">
                    {findings.slice(0, 5).map((f) => (
                      <tr key={f.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-2.5 px-3">
                          <SeverityBadge severity={f.severity} size="sm" />
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">{f.category}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-200">{f.title}</td>
                        <td className="py-2.5 px-3 text-slate-400">{f.projectName || f.projectId}</td>
                        <td className="py-2.5 px-3">
                          <StatusBadge status={f.status} />
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">
                          {new Date(f.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      <TargetCheckModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
