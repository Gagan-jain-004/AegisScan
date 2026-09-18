"use client";

import React from "react";
import Link from "next/link";
import {
  Shield,
  ShieldCheck,
  Zap,
  Lock,
  Flame,
  FileText,
  Terminal,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Server,
  Layers,
  Code2,
} from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useUser();

  const targetDashboardHref = isSignedIn ? "/dashboard" : "/sign-in";
  const targetProjectHref = isSignedIn ? "/projects" : "/sign-in";

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-sky-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-[#1e293b] bg-[#090d16]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-gradient-to-br from-sky-600 to-sky-800 flex items-center justify-center border border-sky-500/40 shadow-sm shadow-sky-950">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">AegisScan</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs text-slate-300 font-medium">
            <a href="#features" className="hover:text-sky-400 transition-colors">
              Features
            </a>
            <a href="#methodology" className="hover:text-sky-400 transition-colors">
              Methodology
            </a>
            <a href="#detection" className="hover:text-sky-400 transition-colors">
              Threat Detection
            </a>
            <Link href="/docs" className="hover:text-sky-400 transition-colors">
              Documentation
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {!isLoaded ? (
              <div className="w-16 h-8 bg-slate-900 animate-pulse rounded" />
            ) : isSignedIn ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="text-xs font-mono font-medium px-3.5 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1.5 transition-colors"
                >
                  SOC Dashboard
                </Link>
                <UserButton />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/sign-in"
                  className="text-xs font-mono text-slate-300 hover:text-white px-3 py-1.5 rounded hover:bg-slate-900 border border-transparent hover:border-[#1e293b] transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="text-xs font-mono font-medium px-3.5 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 px-4 sm:px-6 max-w-7xl mx-auto text-center">
        {/* Subtle glowing backdrop */}
        <div className="absolute inset-0 max-w-4xl mx-auto h-96 bg-gradient-to-b from-sky-600/10 via-transparent to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-sky-800/60 bg-sky-950/40 text-sky-300 text-xs font-mono mb-6">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          Enterprise Defensive Security Workspace
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 max-w-4xl mx-auto leading-tight">
          Understand Your Web Application's{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-teal-300">
            Security Posture
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Assess authorized web applications, monitor security events, detect suspicious activity, and investigate incidents from a single security workspace.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={targetProjectHref}
            className="w-full sm:w-auto px-6 py-3 rounded bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-sky-950 transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            Start Assessment
          </Link>
          <Link
            href={targetDashboardHref}
            className="w-full sm:w-auto px-6 py-3 rounded bg-[#090d16] hover:bg-slate-900 border border-[#1e293b] text-slate-200 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            Explore Dashboard
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>

        {/* Responsible Use Disclaimer Banner */}
        <div className="mt-12 max-w-xl mx-auto p-3 bg-slate-950/80 border border-slate-800/80 rounded-lg text-xs text-slate-400 flex items-center justify-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>AegisScan is designed for authorized security assessment and defensive monitoring.</span>
        </div>
      </section>

      {/* Hero Dashboard Preview Card */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="bg-[#090d16] border border-[#1e293b] rounded-xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-xs font-mono text-slate-400">aegisscan://soc-telemetry-feed</span>
            </div>
            <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              LIVE TELEMETRY STREAM
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#020617] border border-[#1e293b] p-4 rounded-lg space-y-2">
              <div className="text-xs font-mono text-slate-400 uppercase">Assessment Engine</div>
              <div className="text-2xl font-bold font-mono text-sky-400">Active Posture Checks</div>
              <div className="text-xs text-slate-400">Safe evaluation across HTTPS, Headers, Cookies</div>
            </div>

            <div className="bg-[#020617] border border-[#1e293b] p-4 rounded-lg space-y-2">
              <div className="text-xs font-mono text-slate-400 uppercase">Threat Detection</div>
              <div className="text-2xl font-bold font-mono text-rose-400">Real-Time Correlation</div>
              <div className="text-xs text-slate-400">Brute-force, SQLi & XSS signature analysis</div>
            </div>

            <div className="bg-[#020617] border border-[#1e293b] p-4 rounded-lg space-y-2">
              <div className="text-xs font-mono text-slate-400 uppercase">Protected Scope</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">SSRF Guarded</div>
              <div className="text-xs text-slate-400">Private RFC1918 & metadata protected</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 border-t border-[#1e293b] bg-[#050811]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
              Enterprise Defensive Security Modules
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              A comprehensive toolkit for developers, DevOps teams, and security engineers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#090d16] border border-[#1e293b] p-6 rounded-lg space-y-3 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded bg-sky-950/60 border border-sky-800/60 flex items-center justify-center text-sky-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-100">Safe Posture Assessment</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Execute automated passive audits inspecting HTTPS encryption, TLS certificate validity, HTTP headers (CSP, HSTS, XFO), cookie security flags, and redirect chains.
              </p>
            </div>

            <div className="bg-[#090d16] border border-[#1e293b] p-6 rounded-lg space-y-3 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-100">Real-Time Threat Detection</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ingest authentication and access telemetry via secure API keys. Automatically detect brute-force login attacks, injection probe patterns, and unauthorized privilege escalation.
              </p>
            </div>

            <div className="bg-[#090d16] border border-[#1e293b] p-6 rounded-lg space-y-3 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-100">Executive Security Reports</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate professional, printable executive assessment reports summarizing findings, remediation recommendations, score breakdowns, and methodology disclaimers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section id="methodology" className="py-20 border-t border-[#1e293b] bg-[#020617] scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-sky-950/80 border border-sky-800 text-sky-300 font-mono text-xs mb-3">
              <Lock className="w-3.5 h-3.5" /> Strictly Defensive Philosophy
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
              Responsible & Safe Assessment Methodology
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              AegisScan uses non-destructive, authorized evaluation standards designed to protect your infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#090d16] border border-[#1e293b] p-5 rounded-lg space-y-3">
              <div className="text-sky-400 font-mono text-xs font-bold uppercase tracking-wider">01. SSRF Shield</div>
              <h4 className="text-sm font-semibold text-slate-200">DNS & IP Validation</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Prevents scans targeting <code className="text-sky-300">localhost</code>, loopbacks, RFC 1918 private subnets, and cloud metadata (AWS/GCP/Azure).
              </p>
            </div>

            <div className="bg-[#090d16] border border-[#1e293b] p-5 rounded-lg space-y-3">
              <div className="text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">02. Passive Audits</div>
              <h4 className="text-sm font-semibold text-slate-200">Non-Destructive</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Safe TLS certificate checks, HTTP security response header evaluation (CSP, HSTS, XFO), and cookie attribute inspection.
              </p>
            </div>

            <div className="bg-[#090d16] border border-[#1e293b] p-5 rounded-lg space-y-3">
              <div className="text-teal-400 font-mono text-xs font-bold uppercase tracking-wider">03. RFC 9116 Standards</div>
              <h4 className="text-sm font-semibold text-slate-200">Security.txt & Metadata</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Verifies public security vulnerability disclosure policies, robots.txt directives, and server banner disclosures.
              </p>
            </div>

            <div className="bg-[#090d16] border border-[#1e293b] p-5 rounded-lg space-y-3">
              <div className="text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">04. Weighted Scoring</div>
              <h4 className="text-sm font-semibold text-slate-200">0-100 Posture Score</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Categorized risk weighting across Transport (30%), Headers (35%), Cookies (20%), and Policy (15%).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Threat Detection Section */}
      <section id="detection" className="py-20 border-t border-[#1e293b] bg-[#050811] scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-rose-950/80 border border-rose-800 text-rose-300 font-mono text-xs mb-3">
              <Flame className="w-3.5 h-3.5" /> SOC Correlation Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
              Real-Time Defensive Threat Detection
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Correlate incoming authentication telemetry and HTTP events to instantly alert your team on cyber attacks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#090d16] border border-[#1e293b] p-6 rounded-lg space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-rose-400">BRUTE_FORCE</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">CRITICAL</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-200">Credential Stuffing & Brute Force</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatically detects when more than 5 failed login events occur within a 60-second sliding window for a single IP or user account.
              </p>
            </div>

            <div className="bg-[#090d16] border border-[#1e293b] p-6 rounded-lg space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400">AUTH_ANOMALY</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">HIGH</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-200">Sequence Anomaly & Account Takeover</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Flags suspicious login patterns where multiple authentication failures are abruptly followed by successful logins from mismatched geographic IPs.
              </p>
            </div>

            <div className="bg-[#090d16] border border-[#1e293b] p-6 rounded-lg space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-red-400">INJECTION_PROBES</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">HIGH</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-200">SQLi & XSS Payload Telemetry</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluates query parameters and request payloads against standard OWASP signatures (e.g., UNION SELECT, script tag injections, traversal probes).
              </p>
            </div>

            <div className="bg-[#090d16] border border-[#1e293b] p-6 rounded-lg space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-orange-400">ACCESS_CONTROL</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-800">MEDIUM</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-200">BOLA & IDOR Unauthorized Probing</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Flags repeated HTTP 401/403 attempts targeting administrative or restricted object endpoints.
              </p>
            </div>

            <div className="bg-[#090d16] border border-[#1e293b] p-6 rounded-lg space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-yellow-400">RATE_LIMIT_BURST</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-950 text-yellow-300 border border-yellow-800">MEDIUM</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-200">Rate Limit Saturation</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Detects sustained bursts of 429 Too Many Requests responses indicating automated scrapers or DoS attempts.
              </p>
            </div>

            <div className="bg-[#090d16] border border-sky-800/60 p-6 rounded-lg space-y-3 bg-gradient-to-b from-sky-950/30 to-[#090d16] flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono font-bold text-sky-400 mb-2">DEVELOPER SDK</div>
                <h4 className="text-sm font-semibold text-slate-200">aegisscan-node on NPM</h4>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  Send telemetry with 1 line of code using our published client library.
                </p>
              </div>
              <Link
                href="/docs"
                className="text-xs font-mono font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1.5 transition-colors pt-2"
              >
                <span>Read SDK Integration Docs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e293b] bg-[#090d16] py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-sky-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm text-slate-200">AegisScan Security Platform</span>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            Designed for authorized security posture assessment & defensive monitoring.
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <Link href="/docs" className="hover:text-sky-400 transition-colors">
              Developer Docs
            </Link>
            <Link href="/dashboard" className="hover:text-sky-400 transition-colors">
              SOC Workspace
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
