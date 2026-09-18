"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { SeverityBadge } from "@/components/severity-badge";
import { StatusBadge } from "@/components/status-badge";
import {
  AlertTriangle,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ExternalLink,
} from "lucide-react";
import { Finding, Project, Severity, FindingCategory, FindingStatus } from "@/lib/types";

export default function FindingsPage() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("ALL");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFinding, setActiveFinding] = useState<Finding | null>(null);

  const fetchData = async () => {
    try {
      const [findRes, projRes] = await Promise.all([
        fetch("/api/findings").then((r) => r.json()),
        fetch("/api/projects").then((r) => r.json()),
      ]);
      setFindings(findRes.findings || []);
      setProjects(projRes.projects || []);
      if (findRes.findings?.length > 0) {
        setActiveFinding(findRes.findings[0]);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (findingId: string, newStatus: FindingStatus) => {
    try {
      const res = await fetch(`/api/findings/${findingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setFindings((prev) =>
          prev.map((f) => (f.id === findingId ? { ...f, status: newStatus } : f))
        );
        if (activeFinding?.id === findingId) {
          setActiveFinding((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch {
      // Ignore
    }
  };

  const filtered = findings.filter((f) => {
    if (selectedProject !== "ALL" && f.projectId !== selectedProject) return false;
    if (selectedSeverity !== "ALL" && f.severity !== selectedSeverity) return false;
    if (selectedCategory !== "ALL" && f.category !== selectedCategory) return false;
    if (selectedStatus !== "ALL" && f.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return f.title.toLowerCase().includes(q) || f.description.toLowerCase().includes(q);
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
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <h1 className="text-xl font-bold tracking-tight text-slate-100">
                  Security Findings Explorer
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Triage, inspect evidence, and manage remediation status for posture vulnerabilities.
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-[#090d16] border border-[#1e293b] rounded-lg p-3 grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 text-[10px] font-mono uppercase mb-1">Project Scope</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full bg-[#020617] border border-[#1e293b] rounded px-2.5 py-1.5 text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Projects ({projects.length})</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 text-[10px] font-mono uppercase mb-1">Severity</label>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="w-full bg-[#020617] border border-[#1e293b] rounded px-2.5 py-1.5 text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
                <option value="INFO">Info</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 text-[10px] font-mono uppercase mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-[#020617] border border-[#1e293b] rounded px-2.5 py-1.5 text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="HEADERS">Security Headers</option>
                <option value="HTTPS">HTTPS & Redirects</option>
                <option value="COOKIES">Cookie Hardening</option>
                <option value="TLS">TLS Handshake</option>
                <option value="METADATA">Information Disclosure</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 text-[10px] font-mono uppercase mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-[#020617] border border-[#1e293b] rounded px-2.5 py-1.5 text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="ACKNOWLEDGED">Acknowledged</option>
                <option value="RESOLVED">Resolved</option>
                <option value="FALSE_POSITIVE">False Positive</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 text-[10px] font-mono uppercase mb-1">Search Findings</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#020617] border border-[#1e293b] rounded px-2.5 py-1.5 text-slate-300 focus:outline-none font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Master-Detail Split Pane */}
          {filtered.length === 0 ? (
            <div className="p-12 bg-[#090d16] border border-[#1e293b] rounded-lg text-center text-xs text-slate-500 font-mono">
              No findings match the selected filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Finding Items List */}
              <div className="lg:col-span-5 bg-[#090d16] border border-[#1e293b] rounded-lg divide-y divide-[#1e293b] overflow-y-auto max-h-[680px]">
                {filtered.map((f) => {
                  const isSelected = activeFinding?.id === f.id;

                  return (
                    <div
                      key={f.id}
                      onClick={() => setActiveFinding(f)}
                      className={`p-3.5 cursor-pointer transition-colors space-y-1.5 ${
                        isSelected ? "bg-slate-800/60 border-l-2 border-l-sky-500" : "hover:bg-slate-900/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <SeverityBadge severity={f.severity} size="sm" />
                          <span className="text-[10px] font-mono text-slate-400">[{f.category}]</span>
                        </div>
                        <StatusBadge status={f.status} />
                      </div>

                      <div className="text-xs font-semibold text-slate-200 line-clamp-1">{f.title}</div>
                      <div className="text-[11px] text-slate-400 truncate">{f.projectName || f.projectId}</div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Finding Inspector Details */}
              <div className="lg:col-span-7 bg-[#090d16] border border-[#1e293b] rounded-lg p-5 space-y-5">
                {activeFinding ? (
                  <div className="space-y-4">
                    {/* Header Info */}
                    <div className="flex items-start justify-between border-b border-[#1e293b] pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <SeverityBadge severity={activeFinding.severity} />
                          <span className="text-xs font-mono text-slate-400">[{activeFinding.category}]</span>
                        </div>
                        <h2 className="text-base font-bold text-slate-100">{activeFinding.title}</h2>
                        <div className="text-xs text-slate-400 font-mono">
                          Scope: {activeFinding.projectName || activeFinding.projectId}
                        </div>
                      </div>

                      {/* Status Lifecycle Actions */}
                      <div className="flex items-center gap-1">
                        <select
                          value={activeFinding.status}
                          onChange={(e) => handleStatusChange(activeFinding.id, e.target.value as FindingStatus)}
                          className="bg-[#020617] border border-[#1e293b] rounded px-2.5 py-1 text-xs font-mono font-medium text-sky-400 focus:outline-none"
                        >
                          <option value="OPEN">Mark OPEN</option>
                          <option value="ACKNOWLEDGED">Mark ACKNOWLEDGED</option>
                          <option value="RESOLVED">Mark RESOLVED</option>
                          <option value="FALSE_POSITIVE">Mark FALSE POSITIVE</option>
                        </select>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">Description</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">{activeFinding.description}</p>
                    </div>

                    {/* Observed Evidence */}
                    {activeFinding.evidence && (
                      <div className="space-y-1">
                        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">Observed Evidence</h3>
                        <pre className="p-3 bg-[#020617] border border-[#1e293b] rounded font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap">
                          {activeFinding.evidence}
                        </pre>
                      </div>
                    )}

                    {/* Remediation */}
                    {activeFinding.recommendation && (
                      <div className="space-y-1">
                        <h3 className="text-xs font-mono uppercase tracking-wider text-sky-400">Remediation Guide</h3>
                        <div className="p-3 bg-sky-950/20 border border-sky-900/40 rounded text-xs text-sky-200 leading-relaxed">
                          {activeFinding.recommendation}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-slate-500 font-mono text-xs py-12">
                    Select a finding to inspect evidence and triage.
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
