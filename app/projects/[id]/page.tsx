"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { SeverityBadge } from "@/components/severity-badge";
import { StatusBadge } from "@/components/status-badge";
import { ApiKeyModal } from "@/components/api-key-modal";
import {
  FolderGit2,
  Play,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Activity,
  KeyRound,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { Project, Assessment, Finding, SecurityEvent, Incident, ApiKey, Report } from "@/lib/types";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<"overview" | "assessments" | "findings" | "events" | "incidents" | "reports" | "integration">("overview");

  const [project, setProject] = useState<Project | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setProject(data.project);
      setAssessments(data.assessments || []);
      setFindings(data.findings || []);
      setEvents(data.events || []);
      setIncidents(data.incidents || []);
      setApiKeys(data.apiKeys || []);
      setReports(data.reports || []);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const handleRunAssessment = async () => {
    setIsScanning(true);
    setScanMessage("Running safe security posture checks against target...");

    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Assessment failed");
      }

      setScanMessage(`Scan finished! Score: ${data.result?.scoreBreakdown?.overallScore ?? 100}/100`);
      setTimeout(() => setScanMessage(null), 4000);
      fetchProjectDetails();
      setActiveTab("assessments");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed";
      setScanMessage(`Assessment Error: ${msg}`);
      setTimeout(() => setScanMessage(null), 5000);
    } finally {
      setIsScanning(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: id,
          assessmentId: assessments[0]?.id,
          reportType: "EXECUTIVE",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchProjectDetails();
        setActiveTab("reports");
      }
    } catch {
      // Ignore
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm("Revoke this API Key? Connected applications will lose access.")) return;
    try {
      await fetch("/api/api-keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId }),
      });
      fetchProjectDetails();
    } catch {
      // Ignore
    }
  };

  if (loading && !project) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-slate-400 font-mono text-xs">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading Project Scope...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#020617] p-8 text-center text-slate-400">
        Project not found. <Link href="/projects" className="text-sky-400 underline ml-2">Back to Projects</Link>
      </div>
    );
  }

  const latestScan = assessments[0];

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 max-w-7xl">
          {/* Top Breadcrumb & Header */}
          <div className="border-b border-[#1e293b] pb-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <Link href="/projects" className="hover:text-slate-300">
                Projects
              </Link>
              <span>/</span>
              <span className="text-slate-300">{project.name}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold tracking-tight text-slate-100">{project.name}</h1>
                  <StatusBadge status={project.status} />
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-1">
                  <span>Target:</span>
                  <a
                    href={project.targetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 hover:underline flex items-center gap-1"
                  >
                    {project.targetUrl} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleRunAssessment}
                  disabled={isScanning}
                  className="px-4 py-2 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {isScanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  {isScanning ? "Running Scan..." : "Run Posture Scan"}
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 pt-2 overflow-x-auto text-xs font-medium text-slate-400 border-t border-[#1e293b]/60">
              {[
                { id: "overview", label: "Overview" },
                { id: "assessments", label: `Assessments (${assessments.length})` },
                { id: "findings", label: `Findings (${findings.length})` },
                { id: "events", label: `Events (${events.length})` },
                { id: "incidents", label: `Incidents (${incidents.length})` },
                { id: "reports", label: `Reports (${reports.length})` },
                { id: "integration", label: "API Keys & Ingest" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-slate-800 text-slate-100 font-semibold"
                      : "hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {scanMessage && (
            <div className="p-3 bg-sky-950/60 border border-sky-800/80 rounded text-xs font-mono text-sky-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{scanMessage}</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Score & Health Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#090d16] border border-[#1e293b] rounded-lg p-5 space-y-2">
                  <div className="text-xs font-mono uppercase text-slate-400">Security Posture Score</div>
                  <div className="text-4xl font-extrabold font-mono text-sky-400">
                    {latestScan?.securityScore !== null && latestScan?.securityScore !== undefined
                      ? `${latestScan.securityScore}/100`
                      : "Not Scanned"}
                  </div>
                  <p className="text-xs text-slate-500">
                    Calculated from HTTPS, Header enforcement, Cookie flags, and TLS ciphers.
                  </p>
                </div>

                <div className="bg-[#090d16] border border-[#1e293b] rounded-lg p-5 space-y-2">
                  <div className="text-xs font-mono uppercase text-slate-400">Open Posture Findings</div>
                  <div className="text-4xl font-extrabold font-mono text-orange-400">
                    {findings.filter((f) => f.status === "OPEN").length}
                  </div>
                  <p className="text-xs text-slate-500">
                    {findings.filter((f) => f.severity === "CRITICAL" || f.severity === "HIGH").length} High or Critical severity
                  </p>
                </div>

                <div className="bg-[#090d16] border border-[#1e293b] rounded-lg p-5 space-y-2">
                  <div className="text-xs font-mono uppercase text-slate-400">Telemetry Monitoring</div>
                  <div className="text-4xl font-extrabold font-mono text-emerald-400">
                    {events.length} Events
                  </div>
                  <p className="text-xs text-slate-500">
                    {incidents.filter((i) => i.status === "OPEN").length} Open Incident Alerts
                  </p>
                </div>
              </div>

              {/* Assessment Engine Details */}
              <div className="bg-[#090d16] border border-[#1e293b] rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-100">Assessment Check Modules</h2>
                    <p className="text-xs text-slate-400">
                      Standard defensive check categories executed against this application.
                    </p>
                  </div>
                  <button
                    onClick={handleRunAssessment}
                    disabled={isScanning}
                    className="px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Play className="w-3 h-3" /> Run Checks
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-[#020617] border border-[#1e293b] rounded space-y-1">
                    <div className="font-semibold text-slate-200">HTTPS & Redirects</div>
                    <div className="text-slate-400 text-[11px]">Enforces TLS protocol and verifies port 80 automatic upgrade.</div>
                  </div>

                  <div className="p-3 bg-[#020617] border border-[#1e293b] rounded space-y-1">
                    <div className="font-semibold text-slate-200">Security Headers</div>
                    <div className="text-slate-400 text-[11px]">Evaluates CSP, HSTS, X-Content-Type-Options, X-Frame-Options.</div>
                  </div>

                  <div className="p-3 bg-[#020617] border border-[#1e293b] rounded space-y-1">
                    <div className="font-semibold text-slate-200">Cookie Hardening</div>
                    <div className="text-slate-400 text-[11px]">Inspects Secure, HttpOnly, and SameSite flags on session tokens.</div>
                  </div>

                  <div className="p-3 bg-[#020617] border border-[#1e293b] rounded space-y-1">
                    <div className="font-semibold text-slate-200">Information Disclosure</div>
                    <div className="text-slate-400 text-[11px]">Checks Server version leaks, X-Powered-By, and RFC 9116 security.txt.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ASSESSMENTS */}
          {activeTab === "assessments" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-100">Assessment History</h2>
                <button
                  onClick={handleRunAssessment}
                  disabled={isScanning}
                  className="px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Play className="w-3 h-3" /> Start New Assessment
                </button>
              </div>

              {assessments.length === 0 ? (
                <div className="p-8 bg-[#090d16] border border-[#1e293b] rounded text-center text-xs text-slate-500 font-mono">
                  No assessments executed yet for this project. Click "Start New Assessment" above.
                </div>
              ) : (
                <div className="space-y-3">
                  {assessments.map((a, idx) => (
                    <div
                      key={a.id}
                      className="bg-[#090d16] border border-[#1e293b] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-semibold text-slate-200">
                            Assessment #{assessments.length - idx} ({a.id})
                          </span>
                          <StatusBadge status={a.status} />
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          Completed: {a.completedAt ? new Date(a.completedAt).toLocaleString() : "In Progress"}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 font-mono text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px]">SCORE</span>
                          <span className="text-lg font-bold text-sky-400">
                            {a.securityScore !== null ? `${a.securityScore}/100` : "--"}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-500 block text-[10px]">PASSED</span>
                          <span className="text-emerald-400 font-semibold">{a.passedChecks}</span>
                        </div>

                        <div>
                          <span className="text-slate-500 block text-[10px]">FAILED</span>
                          <span className="text-rose-400 font-semibold">{a.failedChecks}</span>
                        </div>

                        <button
                          onClick={handleGenerateReport}
                          className="px-2.5 py-1 rounded border border-[#1e293b] hover:bg-slate-900 text-slate-300 text-xs flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" /> Report
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FINDINGS */}
          {activeTab === "findings" && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-100">Discovered Security Findings</h2>

              {findings.length === 0 ? (
                <div className="p-8 bg-[#090d16] border border-[#1e293b] rounded text-center text-xs text-slate-500 font-mono">
                  No security findings recorded for this project.
                </div>
              ) : (
                <div className="space-y-3">
                  {findings.map((f) => (
                    <div key={f.id} className="bg-[#090d16] border border-[#1e293b] rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <SeverityBadge severity={f.severity} />
                          <span className="text-xs font-mono text-slate-400 uppercase">[{f.category}]</span>
                          <span className="text-sm font-semibold text-slate-100">{f.title}</span>
                        </div>
                        <StatusBadge status={f.status} />
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{f.description}</p>

                      {f.evidence && (
                        <div className="p-2.5 bg-[#020617] border border-[#1e293b] rounded font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap">
                          <span className="text-slate-500 block text-[10px] uppercase mb-1">Observed Evidence</span>
                          {f.evidence}
                        </div>
                      )}

                      {f.recommendation && (
                        <div className="p-2.5 bg-sky-950/20 border border-sky-900/30 rounded text-xs text-sky-200">
                          <strong className="text-sky-400 block mb-0.5">Remediation:</strong>
                          {f.recommendation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: EVENTS */}
          {activeTab === "events" && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-100">Ingested Security Telemetry Logs</h2>

              {events.length === 0 ? (
                <div className="p-8 bg-[#090d16] border border-[#1e293b] rounded text-center text-xs text-slate-500 font-mono">
                  No events ingested yet. Use your API Key to send events via POST /api/security-events.
                </div>
              ) : (
                <div className="bg-[#090d16] border border-[#1e293b] rounded-lg overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#020617] border-b border-[#1e293b] text-slate-400 font-mono uppercase text-[11px]">
                      <tr>
                        <th className="p-2.5">Time</th>
                        <th className="p-2.5">Type</th>
                        <th className="p-2.5">Severity</th>
                        <th className="p-2.5">Source IP</th>
                        <th className="p-2.5">User</th>
                        <th className="p-2.5">Endpoint</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e293b]">
                      {events.map((e) => (
                        <tr key={e.id} className="hover:bg-slate-900/40">
                          <td className="p-2.5 font-mono text-slate-400">{new Date(e.timestamp).toLocaleTimeString()}</td>
                          <td className="p-2.5 font-mono font-semibold text-sky-400">{e.type}</td>
                          <td className="p-2.5"><SeverityBadge severity={e.severity} size="sm" /></td>
                          <td className="p-2.5 font-mono text-slate-300">{e.sourceIp || "N/A"}</td>
                          <td className="p-2.5 font-mono text-slate-300">{e.userId || "anon"}</td>
                          <td className="p-2.5 font-mono text-slate-400 truncate max-w-xs">{e.endpoint || "/"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: INCIDENTS */}
          {activeTab === "incidents" && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-100">Correlated Threat Incidents</h2>

              {incidents.length === 0 ? (
                <div className="p-8 bg-[#090d16] border border-[#1e293b] rounded text-center text-xs text-slate-500 font-mono">
                  No active incidents for this application scope.
                </div>
              ) : (
                <div className="space-y-3">
                  {incidents.map((inc) => (
                    <Link
                      key={inc.id}
                      href={`/incidents/${inc.id}`}
                      className="block bg-[#090d16] border border-[#1e293b] hover:border-slate-700 rounded-lg p-4 space-y-2 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-sky-400">{inc.incidentCode}</span>
                          <SeverityBadge severity={inc.severity} size="sm" />
                          <StatusBadge status={inc.status} />
                        </div>
                        <span className="text-xs font-mono text-slate-500">
                          {new Date(inc.lastSeen).toLocaleString()}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-200">{inc.title}</h3>
                      <p className="text-xs text-slate-400">{inc.description}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: REPORTS */}
          {activeTab === "reports" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-100">Executive Assessment Reports</h2>
                <button
                  onClick={handleGenerateReport}
                  className="px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Generate Report
                </button>
              </div>

              {reports.length === 0 ? (
                <div className="p-8 bg-[#090d16] border border-[#1e293b] rounded text-center text-xs text-slate-500 font-mono">
                  No reports generated yet. Click "Generate Report" to build an executive security assessment document.
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map((r) => (
                    <div key={r.id} className="bg-[#090d16] border border-[#1e293b] rounded-lg p-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-slate-200 font-mono">
                          {r.reportType} SECURITY REPORT ({r.id})
                        </div>
                        <div className="text-xs text-slate-400">Generated by: {r.generatedBy} on {new Date(r.createdAt).toLocaleDateString()}</div>
                      </div>
                      <Link
                        href={`/reports/${r.id}`}
                        className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-[#1e293b] text-sky-400 text-xs font-mono flex items-center gap-1"
                      >
                        View & Print <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: INTEGRATION & API KEYS */}
          {activeTab === "integration" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-100">Project API Keys</h2>
                  <p className="text-xs text-slate-400">
                    Use these keys to authenticate your web applications with the AegisScan telemetry ingestion API.
                  </p>
                </div>
                <button
                  onClick={() => setIsKeyModalOpen(true)}
                  className="px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Generate Ingestion Key
                </button>
              </div>

              {apiKeys.length === 0 ? (
                <div className="p-8 bg-[#090d16] border border-[#1e293b] rounded text-center text-xs text-slate-500 font-mono">
                  No active API keys for this project. Generate a key to begin streaming security events.
                </div>
              ) : (
                <div className="divide-y divide-[#1e293b] bg-[#090d16] border border-[#1e293b] rounded-lg">
                  {apiKeys.map((k) => (
                    <div key={k.id} className="p-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-semibold text-slate-200">{k.name}</span>
                          {k.revokedAt ? (
                            <span className="text-[10px] font-mono text-rose-400 bg-rose-950 px-1.5 py-0.5 rounded border border-rose-900">
                              REVOKED
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-900">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-slate-400">
                          Prefix: <code className="text-sky-300">{k.keyPrefix}...</code> | Created: {new Date(k.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {!k.revokedAt && (
                        <button
                          onClick={() => handleRevokeKey(k.id)}
                          className="px-2.5 py-1 rounded border border-rose-900/50 hover:bg-rose-950/60 text-rose-400 text-xs font-mono"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Ingestion Code Sample */}
              <div className="bg-[#090d16] border border-[#1e293b] rounded-lg p-4 space-y-2">
                <div className="text-xs font-semibold text-slate-200 font-mono">Example Integration (cURL / Node.js)</div>
                <pre className="p-3 bg-[#020617] border border-[#1e293b] rounded text-xs font-mono text-sky-300 overflow-x-auto">
{`curl -X POST https://your-domain.com/api/security-events \\
  -H "Authorization: Bearer aeg_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "LOGIN_FAILED",
    "userId": "user_123",
    "sourceIp": "198.51.100.42",
    "endpoint": "/api/v1/auth/login"
  }'`}
                </pre>
              </div>
            </div>
          )}
        </main>
      </div>

      <ApiKeyModal
        isOpen={isKeyModalOpen}
        projects={project ? [project] : []}
        onClose={() => setIsKeyModalOpen(false)}
        onSuccess={fetchProjectDetails}
      />
    </div>
  );
}
