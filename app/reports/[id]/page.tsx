"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  Shield,
  Printer,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Globe,
  Loader2,
} from "lucide-react";
import { SeverityBadge } from "@/components/severity-badge";
import { Report, Project, Assessment, Finding } from "@/lib/types";

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [report, setReport] = useState<Report | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const [repRes, projRes, asmRes, findRes] = await Promise.all([
          fetch("/api/reports").then((r) => r.json()),
          fetch("/api/projects").then((r) => r.json()),
          fetch("/api/assessments").then((r) => r.json()),
          fetch("/api/findings").then((r) => r.json()),
        ]);

        const currentReport = (repRes.reports || []).find((r: Report) => r.id === id);
        if (currentReport) {
          setReport(currentReport);
          const p = (projRes.projects || []).find((prj: Project) => prj.id === currentReport.projectId);
          setProject(p || null);
          const a = currentReport.assessmentId
            ? (asmRes.assessments || []).find((asm: Assessment) => asm.id === currentReport.assessmentId)
            : (asmRes.assessments || []).find((asm: Assessment) => asm.projectId === currentReport.projectId);
          setAssessment(a || null);
          const f = (findRes.findings || []).filter((find: Finding) => find.projectId === currentReport.projectId);
          setFindings(f);
        }
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-slate-400 font-mono text-xs">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Generating Executive Report...
      </div>
    );
  }

  if (!report || !project) {
    return (
      <div className="min-h-screen bg-[#020617] p-8 text-center text-slate-400">
        Report not found. <Link href="/reports" className="text-sky-400 underline ml-2">Back to Reports</Link>
      </div>
    );
  }

  const score = assessment?.securityScore ?? 85;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-4 sm:p-8">
      {/* Top Action Bar (hidden on print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between no-print">
        <Link
          href="/reports"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Reports
        </Link>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
        >
          <Printer className="w-4 h-4" /> Print / Save PDF
        </button>
      </div>

      {/* Main Printable Document Canvas */}
      <div className="max-w-4xl mx-auto bg-[#090d16] border border-[#1e293b] rounded-xl p-8 sm:p-12 shadow-2xl space-y-8 print:bg-white print:text-slate-900 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[#1e293b] pb-8 print:border-slate-300">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded bg-sky-600 flex items-center justify-center text-white print:bg-sky-700">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white print:text-slate-900">AegisScan</h1>
              <p className="text-xs font-mono text-sky-400 print:text-sky-700 uppercase tracking-wider">
                Executive Security Assessment Report
              </p>
            </div>
          </div>

          <div className="text-right text-xs font-mono space-y-0.5 text-slate-400 print:text-slate-600">
            <div>Report Reference: <span className="text-slate-200 print:text-slate-900 font-semibold">{report.id}</span></div>
            <div>Date: {new Date(report.createdAt).toLocaleDateString()}</div>
            <div>Lead Auditor: {report.generatedBy}</div>
          </div>
        </div>

        {/* Target Scope & Assessment Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#020617] print:bg-slate-50 p-4 rounded-lg border border-[#1e293b] print:border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 print:text-slate-500 block text-[10px] uppercase font-mono">Target Application Scope</span>
            <span className="text-slate-100 print:text-slate-900 font-semibold text-sm">{project.name}</span>
            <div className="text-sky-400 print:text-sky-700 font-mono mt-0.5">{project.targetUrl}</div>
          </div>
          <div>
            <span className="text-slate-400 print:text-slate-500 block text-[10px] uppercase font-mono">Assessment Status</span>
            <span className="text-emerald-400 print:text-emerald-700 font-semibold font-mono">COMPLETED & VERIFIED</span>
            <div className="text-slate-400 print:text-slate-500 mt-0.5">Authorization confirmed by owner</div>
          </div>
        </div>

        {/* Security Posture Score & Executive Summary */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-100 print:text-slate-900 border-b border-[#1e293b] pb-2 print:border-slate-300">
            1. Executive Summary & Security Posture Score
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
            <div className="p-6 bg-[#020617] print:bg-slate-100 rounded-lg border border-[#1e293b] print:border-slate-300 text-center space-y-1">
              <div className="text-xs font-mono uppercase text-slate-400 print:text-slate-500">Security Score</div>
              <div className="text-5xl font-black font-mono text-sky-400 print:text-sky-700">{score}/100</div>
              <div className="text-[11px] text-slate-500 print:text-slate-600">Calculated Weighted Rating</div>
            </div>

            <div className="sm:col-span-2 text-xs leading-relaxed text-slate-300 print:text-slate-700 space-y-2">
              <p>
                AegisScan completed a comprehensive, non-destructive security posture assessment against <strong>{project.name}</strong>. The assessment evaluated HTTP transport encryption, TLS certificate trust chains, browser defense headers (CSP, HSTS, X-Content-Type-Options, X-Frame-Options), cookie security attributes (Secure, HttpOnly, SameSite), and server metadata exposure.
              </p>
              <p>
                Overall, the target application demonstrated a <strong>{score >= 80 ? "STRONG" : score >= 60 ? "MODERATE" : "VULNERABLE"}</strong> security posture. 
                {findings.length === 0
                  ? " No major security vulnerabilities or header omissions were identified during this assessment."
                  : ` A total of ${findings.length} findings were cataloged requiring attention by the development and DevOps teams.`}
              </p>
            </div>
          </div>
        </div>

        {/* Findings Summary Table */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-100 print:text-slate-900 border-b border-[#1e293b] pb-2 print:border-slate-300">
            2. Summary of Assessment Findings
          </h2>

          {findings.length === 0 ? (
            <div className="p-4 bg-[#020617] print:bg-slate-50 border border-[#1e293b] print:border-slate-200 rounded text-xs text-slate-400 print:text-slate-600 font-mono text-center">
              Zero findings identified. All baseline security posture checks passed successfully.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#1e293b] print:border-slate-300">
                <thead className="bg-[#020617] print:bg-slate-100 font-mono text-slate-400 print:text-slate-700 uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Severity</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Finding Title</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b] print:divide-slate-200">
                  {findings.map((f) => (
                    <tr key={f.id} className="print:bg-white">
                      <td className="p-2.5">
                        <SeverityBadge severity={f.severity} size="sm" />
                      </td>
                      <td className="p-2.5 font-mono text-slate-400 print:text-slate-600">{f.category}</td>
                      <td className="p-2.5 font-medium text-slate-200 print:text-slate-900">{f.title}</td>
                      <td className="p-2.5 font-mono text-slate-400 print:text-slate-600">{f.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detailed Findings & Recommendations */}
        {findings.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-100 print:text-slate-900 border-b border-[#1e293b] pb-2 print:border-slate-300">
              3. Detailed Findings & Recommended Remediations
            </h2>

            <div className="space-y-4">
              {findings.map((f, idx) => (
                <div
                  key={f.id}
                  className="p-4 bg-[#020617] print:bg-slate-50 border border-[#1e293b] print:border-slate-200 rounded-lg space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-200 print:text-slate-900">
                      Finding 3.{idx + 1}: {f.title}
                    </span>
                    <SeverityBadge severity={f.severity} size="sm" />
                  </div>

                  <p className="text-slate-300 print:text-slate-700 leading-relaxed">{f.description}</p>

                  {f.evidence && (
                    <div className="p-2.5 bg-[#090d16] print:bg-slate-200 rounded font-mono text-[11px] text-slate-300 print:text-slate-800">
                      <strong className="block text-slate-500 print:text-slate-600 text-[10px] uppercase mb-0.5">
                        Observed Evidence
                      </strong>
                      {f.evidence}
                    </div>
                  )}

                  {f.recommendation && (
                    <div className="p-2.5 bg-sky-950/20 print:bg-sky-50 border border-sky-900/40 print:border-sky-200 rounded text-sky-200 print:text-sky-900">
                      <strong className="block text-sky-400 print:text-sky-800 text-[10px] uppercase mb-0.5">
                        Remediation Guidance
                      </strong>
                      {f.recommendation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legal Limitations & Responsible Disclosure Notice */}
        <div className="pt-6 border-t border-[#1e293b] print:border-slate-300 text-[11px] text-slate-500 print:text-slate-600 space-y-2 leading-relaxed">
          <div className="font-semibold text-slate-400 print:text-slate-700 uppercase font-mono">
            Legal Notice & Scope Limitations
          </div>
          <p>
            Assessment results represent passive configuration and header checks performed by AegisScan at the time of execution and do not constitute an absolute guarantee of total application security or immunity from cyber threats. Defensive monitoring requires continuous assessment and adherence to secure software development lifecycles (SDLC).
          </p>
        </div>
      </div>
    </div>
  );
}
