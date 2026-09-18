"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { History, Shield, Filter, Search, Lock } from "lucide-react";
import { AuditLog } from "@/lib/types";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/audit-logs")
      .then((r) => r.json())
      .then((data) => setLogs(data.auditLogs || []))
      .catch(() => {});
  }, []);

  const filtered = logs.filter((log) => {
    if (actionFilter !== "ALL" && log.action !== actionFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        (log.metadata && log.metadata.toLowerCase().includes(q)) ||
        (log.ipAddress && log.ipAddress.includes(q))
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
                <History className="w-5 h-5 text-sky-400" />
                <h1 className="text-xl font-bold tracking-tight text-slate-100">
                  Immutable Security Audit Trail
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Cryptographically tracked record of all administrative, assessment, key management, and triage events.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-[#090d16] px-3 py-1.5 rounded border border-[#1e293b]">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>APPEND-ONLY INTEGRITY ENFORCED</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-[#090d16] border border-[#1e293b] rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 text-[10px] font-mono uppercase mb-1">Action Type</label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full bg-[#020617] border border-[#1e293b] rounded px-2.5 py-1.5 text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Audit Actions</option>
                <option value="PROJECT_CREATED">PROJECT_CREATED</option>
                <option value="ASSESSMENT_STARTED">ASSESSMENT_STARTED</option>
                <option value="ASSESSMENT_COMPLETED">ASSESSMENT_COMPLETED</option>
                <option value="API_KEY_CREATED">API_KEY_CREATED</option>
                <option value="API_KEY_REVOKED">API_KEY_REVOKED</option>
                <option value="FINDING_STATUS_CHANGED">FINDING_STATUS_CHANGED</option>
                <option value="INCIDENT_CREATED">INCIDENT_CREATED</option>
                <option value="INCIDENT_STATUS_CHANGED">INCIDENT_STATUS_CHANGED</option>
                <option value="REPORT_GENERATED">REPORT_GENERATED</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 text-[10px] font-mono uppercase mb-1">Search Logs</label>
              <input
                type="text"
                placeholder="Search action, IP, metadata..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#020617] border border-[#1e293b] rounded px-2.5 py-1.5 text-slate-300 focus:outline-none font-mono text-xs"
              />
            </div>
          </div>

          {/* Audit Logs Table */}
          {filtered.length === 0 ? (
            <div className="p-12 bg-[#090d16] border border-[#1e293b] rounded-lg text-center text-xs text-slate-500 font-mono">
              No audit logs matching current filter.
            </div>
          ) : (
            <div className="bg-[#090d16] border border-[#1e293b] rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#020617] border-b border-[#1e293b] text-slate-400 font-mono uppercase text-[11px]">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Actor</th>
                    <th className="p-3">Source IP</th>
                    <th className="p-3">Event Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]">
                  {filtered.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/40">
                      <td className="p-3 font-mono text-slate-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3 font-mono font-semibold text-sky-400 whitespace-nowrap">
                        {log.action}
                      </td>
                      <td className="p-3 font-mono text-slate-300">{log.actorId}</td>
                      <td className="p-3 font-mono text-slate-400">{log.ipAddress || "127.0.0.1"}</td>
                      <td className="p-3 font-mono text-slate-400 max-w-md truncate">
                        {log.metadata || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
