"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { StatusBadge } from "@/components/status-badge";
import { TargetCheckModal } from "@/components/target-check-modal";
import {
  FolderGit2,
  Plus,
  Play,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Activity,
  Trash2,
  Clock,
  Loader2,
} from "lucide-react";
import { Project } from "@/lib/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [runningProjectId, setRunningProjectId] = useState<string | null>(null);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data.projects || []);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleRunScan = async (projectId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRunningProjectId(projectId);
    setScanMessage("Executing defensive security assessment...");

    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Assessment failed");
      }

      setScanMessage(`Scan finished! Score: ${data.result?.scoreBreakdown?.overallScore ?? 100}/100`);
      setTimeout(() => setScanMessage(null), 4000);
      fetchProjects();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Scan failed";
      setScanMessage(`Error: ${msg}`);
      setTimeout(() => setScanMessage(null), 5000);
    } finally {
      setRunningProjectId(null);
    }
  };

  const handleDelete = async (projectId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      fetchProjects();
    } catch {
      // Ignore
    }
  };

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
                <FolderGit2 className="w-5 h-5 text-sky-400" />
                <h1 className="text-xl font-bold tracking-tight text-slate-100">
                  Target Applications & Projects
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Manage registered application scopes, trigger posture assessments, and inspect scan histories.
              </p>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3.5 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Register Target
            </button>
          </div>

          {scanMessage && (
            <div className="p-3 bg-sky-950/60 border border-sky-800/80 rounded text-xs font-mono text-sky-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{scanMessage}</span>
            </div>
          )}

          {/* Project List */}
          {projects.length === 0 && !loading ? (
            <div className="p-12 bg-[#090d16] border border-[#1e293b] rounded-lg text-center space-y-3">
              <FolderGit2 className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-200">No Target Projects Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Register an application you own or are explicitly authorized to assess to begin defensive posture scans.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-2 px-4 py-2 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Register Application
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p) => {
                const isScanning = runningProjectId === p.id;

                return (
                  <div
                    key={p.id}
                    className="bg-[#090d16] border border-[#1e293b] rounded-lg p-4 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-sm space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <StatusBadge status={p.status} />
                        <button
                          onClick={(e) => handleDelete(p.id, e)}
                          title="Delete project"
                          className="text-slate-500 hover:text-rose-400 text-xs p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <Link href={`/projects/${p.id}`} className="block group">
                        <h2 className="text-sm font-semibold text-slate-100 group-hover:text-sky-400 transition-colors">
                          {p.name}
                        </h2>
                      </Link>

                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono truncate">
                        <span className="truncate">{p.targetUrl}</span>
                      </div>

                      {p.description && (
                        <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>
                      )}
                    </div>

                    {/* Stats Pill Row */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#1e293b] text-center font-mono text-xs">
                      <div>
                        <div className="text-slate-400 text-[10px] uppercase">Scans</div>
                        <div className="text-slate-200 font-semibold">{p._count?.assessments ?? 0}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px] uppercase">Findings</div>
                        <div className="text-orange-400 font-semibold">{p._count?.findings ?? 0}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px] uppercase">Incidents</div>
                        <div className="text-rose-400 font-semibold">{p._count?.incidents ?? 0}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <Link
                        href={`/projects/${p.id}`}
                        className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono"
                      >
                        Details <ExternalLink className="w-3 h-3" />
                      </Link>

                      <button
                        onClick={(e) => handleRunScan(p.id, e)}
                        disabled={isScanning}
                        className="px-3 py-1.5 rounded bg-sky-600/90 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isScanning ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                        {isScanning ? "Scanning..." : "Run Assessment"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <TargetCheckModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchProjects}
      />
    </div>
  );
}
