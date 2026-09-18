"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import {
  FileText,
  Plus,
  ExternalLink,
  Download,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { Report, Project } from "@/lib/types";

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [generating, setGenerating] = useState(false);

  const fetchData = async () => {
    try {
      const [repRes, projRes] = await Promise.all([
        fetch("/api/reports").then((r) => r.json()),
        fetch("/api/projects").then((r) => r.json()),
      ]);
      setReports(repRes.reports || []);
      setProjects(projRes.projects || []);
      if (projRes.projects?.length > 0) {
        setSelectedProjectId(projRes.projects[0].id);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateReport = async () => {
    if (!selectedProjectId) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId,
          reportType: "EXECUTIVE",
        }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch {
      // Ignore
    } finally {
      setGenerating(false);
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
                <FileText className="w-5 h-5 text-sky-400" />
                <h1 className="text-xl font-bold tracking-tight text-slate-100">
                  Executive Security Assessment Reports
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Formal security posture assessment summaries, risk distributions, and remediation roadmaps.
              </p>
            </div>

            {projects.length > 0 && (
              <div className="flex items-center gap-2">
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="bg-[#090d16] border border-[#1e293b] rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleCreateReport}
                  disabled={generating}
                  className="px-3.5 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Generate Report
                </button>
              </div>
            )}
          </div>

          {/* Reports Catalog */}
          {reports.length === 0 ? (
            <div className="p-12 bg-[#090d16] border border-[#1e293b] rounded-lg text-center text-xs text-slate-500 font-mono space-y-2">
              <FileText className="w-10 h-10 mx-auto text-slate-600" />
              <p>No executive reports generated yet.</p>
              <p className="text-[11px] text-slate-600">
                Register a project, perform a posture scan, and click "Generate Report" above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.map((r) => (
                <div
                  key={r.id}
                  className="bg-[#090d16] border border-[#1e293b] hover:border-slate-700 rounded-lg p-5 flex flex-col justify-between space-y-4 shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/80 border border-sky-800 text-sky-400">
                        {r.reportType} REPORT
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h2 className="text-sm font-semibold text-slate-100">{r.projectName || r.projectId}</h2>
                    <div className="text-xs text-slate-400 font-mono">
                      Analyst: {r.generatedBy}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#1e293b]">
                    <span className="text-[11px] font-mono text-slate-500">Report ID: {r.id}</span>
                    <Link
                      href={`/reports/${r.id}`}
                      className="px-3 py-1.5 rounded bg-sky-600/90 hover:bg-sky-500 text-white text-xs font-mono flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" /> View & Print
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
