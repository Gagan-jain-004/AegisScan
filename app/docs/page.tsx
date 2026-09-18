"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield,
  BookOpen,
  Terminal,
  KeyRound,
  Code2,
  Copy,
  Check,
  ArrowLeft,
  ArrowRight,
  Lock,
  Layers,
  Activity,
  Flame,
  AlertTriangle,
  FileCode,
} from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";

export default function DocsPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const { isSignedIn, isLoaded } = useUser();

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2500);
  };

  const curlExample = `curl -X POST https://your-aegisscan-domain.com/api/security-events \\
  -H "Authorization: Bearer aeg_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "LOGIN_FAILED",
    "userId": "admin@company.com",
    "sourceIp": "198.51.100.42",
    "endpoint": "/api/v1/auth/login",
    "userAgent": "Mozilla/5.0 ...",
    "metadata": { "reason": "invalid_credentials", "attempt": 1 }
  }'`;

  const nodeSdkExample = `import { AegisScan } from "aegisscan-node";

const security = new AegisScan({
  apiKey: process.env.AEGISSCAN_API_KEY,
  endpoint: "https://your-aegisscan-domain.com"
});

// Express.js / Next.js Auth Middleware Hook
export async function handleLoginFailure(req, res) {
  await security.loginFailed({
    userId: req.body.email,
    sourceIp: req.ip,
    endpoint: "/api/auth/login",
    userAgent: req.headers["user-agent"]
  });
}`;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-sky-500 selection:text-white">
      {/* Public Top Header */}
      <header className="border-b border-[#1e293b] bg-[#090d16]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-sky-600 to-sky-800 flex items-center justify-center border border-sky-500/40 shadow-sm shadow-sky-950">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base tracking-tight text-white group-hover:text-sky-400 transition-colors">
                AegisScan
              </span>
            </Link>
            <span className="text-xs font-mono text-slate-500 hidden sm:inline">/</span>
            <span className="text-xs font-mono text-sky-400 font-semibold hidden sm:inline">
              Developer Documentation
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1 px-3 py-1.5 rounded hover:bg-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>

            {!isLoaded ? null : isSignedIn ? (
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

      {/* Docs Body Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Table of Contents */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="sticky top-24 bg-[#090d16] border border-[#1e293b] rounded-lg p-4 space-y-3 text-xs font-mono">
            <div className="text-slate-400 font-bold uppercase tracking-wider text-[11px] pb-2 border-b border-[#1e293b]">
              Documentation Index
            </div>
            <nav className="space-y-1.5 text-slate-400">
              <a href="#overview" className="block py-1 hover:text-sky-400 transition-colors">
                1. Platform Overview
              </a>
              <a href="#authentication" className="block py-1 hover:text-sky-400 transition-colors">
                2. API Authentication
              </a>
              <a href="#ingestion-api" className="block py-1 hover:text-sky-400 transition-colors">
                3. Event Ingestion API
              </a>
              <a href="#event-types" className="block py-1 hover:text-sky-400 transition-colors">
                4. Supported Event Types
              </a>
              <a href="#detection-rules" className="block py-1 hover:text-sky-400 transition-colors">
                5. Defensive Detection Rules
              </a>
              <a href="#sdk-guide" className="block py-1 hover:text-sky-400 transition-colors">
                6. Node.js SDK Integration
              </a>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-9 space-y-12">
          {/* Section 1: Overview */}
          <section id="overview" className="space-y-3 scroll-mt-24">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-sky-950/80 border border-sky-800 text-sky-300 font-mono text-xs">
              <BookOpen className="w-3.5 h-3.5" /> Developer Guide
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              AegisScan Developer Documentation
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              AegisScan provides REST APIs and lightweight SDKs to stream security telemetry, track authentication events, and correlate cyber threats from your web applications into a centralized SOC dashboard.
            </p>
          </section>

          {/* Section 2: Authentication */}
          <section id="authentication" className="space-y-4 pt-4 border-t border-[#1e293b] scroll-mt-24">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-sky-400" />
              <h2 className="text-lg font-bold text-slate-100 font-mono">
                2. API Authentication & Keys
              </h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every request to the event ingestion API requires a Bearer token generated from your Project settings. API keys start with the prefix <code className="text-sky-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">aeg_live_</code> and are hashed server-side using SHA-256.
            </p>
            <div className="p-3 bg-slate-950 border border-[#1e293b] rounded font-mono text-xs text-slate-300">
              Authorization: Bearer aeg_live_7f2910ab8c9d...
            </div>
          </section>

          {/* Section 3: Event Ingestion API */}
          <section id="ingestion-api" className="space-y-4 pt-4 border-t border-[#1e293b] scroll-mt-24">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-sky-400" />
              <h2 className="text-lg font-bold text-slate-100 font-mono">
                3. Security Event Ingestion API (POST /api/security-events)
              </h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Submit structured security events from your application authentication hooks, reverse proxies, or Web Application Firewalls (WAF).
            </p>

            <div className="bg-[#090d16] border border-[#1e293b] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 font-bold border border-sky-800">
                    POST
                  </span>
                  <code className="text-slate-200">/api/security-events</code>
                </div>
                <span className="text-slate-500">JSON Payload</span>
              </div>

              <div className="relative">
                <pre className="p-4 bg-[#020617] border border-[#1e293b] rounded font-mono text-xs text-sky-300 overflow-x-auto leading-relaxed">
                  {curlExample}
                </pre>
                <button
                  onClick={() => copyCode(curlExample, "curl")}
                  className="absolute top-3 right-3 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1"
                >
                  {copied === "curl" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied === "curl" ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </section>

          {/* Section 4: Supported Event Types */}
          <section id="event-types" className="space-y-4 pt-4 border-t border-[#1e293b] scroll-mt-24">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-sky-400" />
              <h2 className="text-lg font-bold text-slate-100 font-mono">
                4. Supported Event Types & Schemas
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3.5 bg-[#090d16] border border-[#1e293b] rounded space-y-1">
                <div className="text-rose-400 font-bold">LOGIN_FAILED</div>
                <div className="text-slate-400 text-[11px]">Triggers brute-force correlation when failure spikes occur.</div>
              </div>

              <div className="p-3.5 bg-[#090d16] border border-[#1e293b] rounded space-y-1">
                <div className="text-emerald-400 font-bold">LOGIN_SUCCESS</div>
                <div className="text-slate-400 text-[11px]">Logged for authentication anomaly & credential stuffing tracking.</div>
              </div>

              <div className="p-3.5 bg-[#090d16] border border-[#1e293b] rounded space-y-1">
                <div className="text-orange-400 font-bold">RATE_LIMIT_TRIGGERED</div>
                <div className="text-slate-400 text-[11px]">Signals persistent rate-limit breaches or DoS probing.</div>
              </div>

              <div className="p-3.5 bg-[#090d16] border border-[#1e293b] rounded space-y-1">
                <div className="text-yellow-400 font-bold">UNAUTHORIZED_ACCESS</div>
                <div className="text-slate-400 text-[11px]">Logged on HTTP 401/403 access attempts to admin endpoints.</div>
              </div>

              <div className="p-3.5 bg-[#090d16] border border-[#1e293b] rounded space-y-1">
                <div className="text-rose-400 font-bold">SQLI_PATTERN_DETECTED</div>
                <div className="text-slate-400 text-[11px]">Flags injection probe regex patterns in query parameters.</div>
              </div>

              <div className="p-3.5 bg-[#090d16] border border-[#1e293b] rounded space-y-1">
                <div className="text-rose-400 font-bold">XSS_PATTERN_DETECTED</div>
                <div className="text-slate-400 text-[11px]">Flags cross-site scripting payload signatures.</div>
              </div>
            </div>
          </section>

          {/* Section 5: Node SDK */}
          <section id="sdk-guide" className="space-y-4 pt-4 border-t border-[#1e293b] scroll-mt-24">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-sky-400" />
              <h2 className="text-lg font-bold text-slate-100 font-mono">
                5. Node.js SDK (aegisscan-node)
              </h2>
            </div>

            <div className="bg-[#090d16] border border-[#1e293b] rounded-lg p-4 space-y-3">
              <div className="text-xs font-mono text-slate-300">
                Install local SDK package: <code className="text-sky-400 font-bold bg-slate-950 px-2 py-1 rounded border border-slate-800">npm install ./packages/aegisscan-node</code>
              </div>

              <div className="relative">
                <pre className="p-4 bg-[#020617] border border-[#1e293b] rounded font-mono text-xs text-sky-300 overflow-x-auto leading-relaxed">
                  {nodeSdkExample}
                </pre>
                <button
                  onClick={() => copyCode(nodeSdkExample, "sdk")}
                  className="absolute top-3 right-3 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1"
                >
                  {copied === "sdk" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied === "sdk" ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
