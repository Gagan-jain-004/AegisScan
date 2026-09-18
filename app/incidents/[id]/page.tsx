"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { SeverityBadge } from "@/components/severity-badge";
import { StatusBadge } from "@/components/status-badge";
import {
  Flame,
  Clock,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  Save,
  Terminal,
  Activity,
  User,
  Globe,
  Loader2,
} from "lucide-react";
import { Incident, SecurityEvent, IncidentStatus } from "@/lib/types";

export default function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [relatedEvents, setRelatedEvents] = useState<SecurityEvent[]>([]);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<IncidentStatus>("OPEN");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/incidents/${id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setIncident(data.incident);
      setRelatedEvents(data.relatedEvents || []);
      setNotes(data.incident?.notes || "");
      setStatus(data.incident?.status || "OPEN");
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/incidents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        fetchDetails();
      }
    } catch {
      // Ignore
    } finally {
      setSaving(false);
    }
  };

  if (loading && !incident) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-slate-400 font-mono text-xs">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading Incident Details...
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="min-h-screen bg-[#020617] p-8 text-center text-slate-400">
        Incident not found. <Link href="/incidents" className="text-sky-400 underline ml-2">Back to Incidents</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 max-w-7xl">
          {/* Back Nav & Header */}
          <div className="border-b border-[#1e293b] pb-5 space-y-3">
            <Link
              href="/incidents"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Incidents
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-mono font-bold text-sky-400">
                    {incident.incidentCode}
                  </span>
                  <SeverityBadge severity={incident.severity} />
                  <StatusBadge status={incident.status} />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-100">{incident.title}</h1>
              </div>

              {/* Status Update Control */}
              <div className="flex items-center gap-3">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as IncidentStatus)}
                  className="bg-[#090d16] border border-[#1e293b] rounded px-3 py-1.5 text-xs font-mono font-medium text-slate-200 focus:outline-none"
                >
                  <option value="OPEN">Status: OPEN</option>
                  <option value="INVESTIGATING">Status: INVESTIGATING</option>
                  <option value="RESOLVED">Status: RESOLVED</option>
                  <option value="FALSE_POSITIVE">Status: FALSE POSITIVE</option>
                </select>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Investigation
                </button>
              </div>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded text-xs font-mono text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Incident status and investigation notes updated in immutable audit log.</span>
            </div>
          )}

          {/* Incident Telemetry Metadata Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-[#090d16] border border-[#1e293b] rounded space-y-1">
              <span className="text-slate-500 block text-[10px] uppercase">Source IP Address</span>
              <span className="text-slate-200 font-semibold text-sm">{incident.sourceIp || "N/A"}</span>
            </div>

            <div className="p-3 bg-[#090d16] border border-[#1e293b] rounded space-y-1">
              <span className="text-slate-500 block text-[10px] uppercase">Correlated Events</span>
              <span className="text-rose-400 font-semibold text-sm">{incident.eventCount} Events</span>
            </div>

            <div className="p-3 bg-[#090d16] border border-[#1e293b] rounded space-y-1">
              <span className="text-slate-500 block text-[10px] uppercase">First Observed</span>
              <span className="text-slate-300">{new Date(incident.firstSeen).toLocaleTimeString()}</span>
            </div>

            <div className="p-3 bg-[#090d16] border border-[#1e293b] rounded space-y-1">
              <span className="text-slate-500 block text-[10px] uppercase">Last Event</span>
              <span className="text-slate-300">{new Date(incident.lastSeen).toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Two-Column Investigation Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Columns: Event Telemetry Timeline */}
            <div className="lg:col-span-7 bg-[#090d16] border border-[#1e293b] rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-400" />
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Correlated Telemetry Timeline
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  {relatedEvents.length} Related Signals
                </span>
              </div>

              {relatedEvents.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 font-mono">
                  No individual event logs recorded for this source.
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1e293b]">
                  {relatedEvents.map((evt, idx) => (
                    <div key={evt.id} className="relative space-y-1">
                      {/* Timeline Dot */}
                      <div className="absolute -left-6 top-1.5 w-2 h-2 rounded-full bg-sky-500 ring-4 ring-[#090d16]" />

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-slate-200">{evt.type}</span>
                          <SeverityBadge severity={evt.severity} size="sm" />
                        </div>
                        <span className="font-mono text-[11px] text-slate-500">
                          {new Date(evt.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="text-xs font-mono text-slate-400 bg-[#020617] p-2 rounded border border-[#1e293b] space-y-0.5">
                        <div>Endpoint: <span className="text-sky-300">{evt.endpoint || "/"}</span></div>
                        <div>User: <span className="text-slate-300">{evt.userId || "anon"}</span></div>
                        {evt.metadata && (
                          <div className="text-[11px] text-slate-500 truncate">
                            Meta: {evt.metadata}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right 5 Columns: Analyst Investigation Notes & Triage */}
            <div className="lg:col-span-5 space-y-4">
              {/* Description Panel */}
              <div className="bg-[#090d16] border border-[#1e293b] rounded-lg p-4 space-y-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">Incident Description</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{incident.description}</p>
              </div>

              {/* Investigation Notes Editor */}
              <div className="bg-[#090d16] border border-[#1e293b] rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300">
                    Analyst Investigation Notes
                  </h3>
                </div>

                <textarea
                  rows={8}
                  placeholder="Record investigation findings, root cause analysis, and remediation steps..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#020617] border border-[#1e293b] focus:border-sky-500 rounded p-3 text-xs font-mono text-slate-200 focus:outline-none leading-relaxed"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-3.5 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
