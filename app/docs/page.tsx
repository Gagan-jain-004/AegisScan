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
  ExternalLink,
  PackageCheck,
  Server,
  Cpu,
} from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";

export default function DocsPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"curl" | "fetch" | "python">("curl");
  const [pkgTab, setPkgTab] = useState<"npm" | "yarn" | "pnpm" | "bun">("npm");
  const { isSignedIn, isLoaded } = useUser();

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2500);
  };

  const curlExample = `curl -X POST https://your-aegisscan-domain.com/api/security-events \\
  -H "Authorization: Bearer aeg_live_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "LOGIN_FAILED",
    "userId": "victim@example.com",
    "sourceIp": "198.51.100.42",
    "endpoint": "/api/v1/auth/login",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "metadata": {
      "reason": "invalid_credentials",
      "attempt": 1
    }
  }'`;

  const fetchExample = `// Native JavaScript / TypeScript (Node.js 18+ or Browser)
const response = await fetch("https://your-aegisscan-domain.com/api/security-events", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": \`Bearer \${process.env.AEGISSCAN_API_KEY}\`
  },
  body: JSON.stringify({
    type: "LOGIN_FAILED",
    userId: "victim@example.com",
    sourceIp: req.ip || "198.51.100.42",
    endpoint: "/api/v1/auth/login",
    metadata: { reason: "invalid_password" }
  })
});

const data = await response.json();
console.log("[AegisScan]", data);`;

  const pythonExample = `import os
import requests

url = "https://your-aegisscan-domain.com/api/security-events"
headers = {
    "Authorization": f"Bearer {os.getenv('AEGISSCAN_API_KEY')}",
    "Content-Type": "application/json"
}
payload = {
    "type": "LOGIN_FAILED",
    "userId": "victim@example.com",
    "sourceIp": "198.51.100.42",
    "endpoint": "/api/v1/auth/login",
    "metadata": {
        "reason": "invalid_credentials"
    }
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;

  const pkgCommands = {
    npm: "npm install aegisscan-node",
    yarn: "yarn add aegisscan-node",
    pnpm: "pnpm add aegisscan-node",
    bun: "bun add aegisscan-node",
  };

  const nodeSdkExample = `import { AegisScan } from "aegisscan-node";

// 1. Initialize client
const security = new AegisScan({
  apiKey: process.env.AEGISSCAN_API_KEY,
  endpoint: "https://your-aegisscan-domain.com" // Defaults to http://localhost:3000
});

// 2. Express.js / Next.js Auth Route Example
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await authenticateUser(email, password);

  if (!user) {
    // 🚨 Report failed login to AegisScan SOC Correlation Engine
    await security.loginFailed({
      userId: email,
      sourceIp: req.ip,
      endpoint: "/api/auth/login",
      metadata: { reason: "invalid_credentials" }
    });

    return res.status(401).json({ error: "Invalid credentials" });
  }

  // ✅ Report successful login
  await security.loginSuccess({
    userId: user.id,
    sourceIp: req.ip,
    endpoint: "/api/auth/login"
  });

  return res.json({ token: "jwt_token_here" });
});`;

  const middlewareExample = `// Next.js Route Handler / Middleware Guard Example
import { NextResponse } from "next/server";
import { AegisScan } from "aegisscan-node";

const security = new AegisScan({ apiKey: process.env.AEGISSCAN_API_KEY });

export async function middleware(req) {
  const isAdmin = req.cookies.get("admin_session");

  if (!isAdmin && req.nextUrl.pathname.startsWith("/admin")) {
    // Flag unauthorized BOLA / IDOR probing
    await security.unauthorizedAccess({
      sourceIp: req.ip || "127.0.0.1",
      endpoint: req.nextUrl.pathname,
      metadata: { attemptedRole: "ADMIN" }
    });

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.next();
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
            <a
              href="https://www.npmjs.com/package/aegisscan-node"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-mono px-2.5 py-1 rounded bg-[#090d16] border border-[#1e293b] text-sky-400 hover:text-sky-300 hover:border-sky-800 transition-colors hidden md:flex items-center gap-1.5"
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span>npm: aegisscan-node</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>

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
            <div className="text-slate-400 font-bold uppercase tracking-wider text-[11px] pb-2 border-b border-[#1e293b] flex items-center justify-between">
              <span>Docs Navigation</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-950 text-sky-400 border border-sky-800">
                v1.0.1
              </span>
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
                6. Node.js SDK (aegisscan-node)
              </a>
              <a href="#error-codes" className="block py-1 hover:text-sky-400 transition-colors">
                7. HTTP Status & Error Codes
              </a>
            </nav>

            <div className="pt-3 border-t border-[#1e293b] space-y-2">
              <div className="text-[11px] text-slate-500 uppercase font-semibold">Published SDK</div>
              <a
                href="https://www.npmjs.com/package/aegisscan-node"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800 hover:border-sky-700 text-sky-400 text-xs transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <PackageCheck className="w-3.5 h-3.5" />
                  <span>aegisscan-node</span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-9 space-y-12">
          {/* Section 1: Overview */}
          <section id="overview" className="space-y-3 scroll-mt-24">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-sky-950/80 border border-sky-800 text-sky-300 font-mono text-xs">
              <BookOpen className="w-3.5 h-3.5" /> Developer Guide & Integration
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              AegisScan Telemetry & Ingestion API Documentation
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              AegisScan provides high-throughput REST APIs and lightweight SDKs to stream defensive security telemetry, failed authentications, privilege escalations, and WAF signatures directly from your web applications into a centralized SOC dashboard.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-[#090d16] border border-[#1e293b] rounded text-xs space-y-1">
                <div className="font-mono text-sky-400 font-bold">Zero Latency Overhead</div>
                <div className="text-slate-400 text-[11px]">Asynchronous non-blocking event submission.</div>
              </div>
              <div className="p-3 bg-[#090d16] border border-[#1e293b] rounded text-xs space-y-1">
                <div className="font-mono text-emerald-400 font-bold">Real-Time Correlation</div>
                <div className="text-slate-400 text-[11px]">Correlates failed logins into actionable SOC incidents.</div>
              </div>
              <div className="p-3 bg-[#090d16] border border-[#1e293b] rounded text-xs space-y-1">
                <div className="font-mono text-amber-400 font-bold">Secure SHA-256 Auth</div>
                <div className="text-slate-400 text-[11px]">Hashed scoped API keys per registered project.</div>
              </div>
            </div>
          </section>

          {/* Section 2: Authentication */}
          <section id="authentication" className="space-y-4 pt-6 border-t border-[#1e293b] scroll-mt-24">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-sky-400" />
              <h2 className="text-lg font-bold text-slate-100 font-mono">
                2. API Authentication & Keys
              </h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every request to the event ingestion API requires a Project API Key passed as a Bearer token in the <code className="text-sky-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">Authorization</code> header. API keys start with the prefix <code className="text-sky-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">aeg_live_</code> and are hashed server-side using cryptographic SHA-256.
            </p>

            <div className="bg-[#090d16] border border-[#1e293b] rounded-lg p-4 space-y-2">
              <div className="text-xs font-mono text-slate-400">Header Format:</div>
              <div className="p-3 bg-slate-950 border border-[#1e293b] rounded font-mono text-xs text-slate-300 flex items-center justify-between">
                <span>Authorization: Bearer aeg_live_7f2910ab8c9d4e5f6a1b2c3d4e5f6a7b</span>
                <button
                  onClick={() => copyCode("Authorization: Bearer aeg_live_YOUR_KEY", "auth-header")}
                  className="text-slate-400 hover:text-white"
                >
                  {copied === "auth-header" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </section>

          {/* Section 3: Event Ingestion API */}
          <section id="ingestion-api" className="space-y-4 pt-6 border-t border-[#1e293b] scroll-mt-24">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-sky-400" />
              <h2 className="text-lg font-bold text-slate-100 font-mono">
                3. Security Event Ingestion API (POST /api/security-events)
              </h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Submit structured security events from your application authentication hooks, reverse proxies, Express middleware, or Web Application Firewalls.
            </p>

            {/* Code Selector Tabs */}
            <div className="bg-[#090d16] border border-[#1e293b] rounded-lg overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#1e293b] px-4 py-2 bg-slate-950/60">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 font-bold border border-sky-800 text-xs font-mono">
                    POST
                  </span>
                  <code className="text-slate-200 text-xs font-mono">/api/security-events</code>
                </div>

                <div className="flex items-center gap-1 text-xs font-mono">
                  {(["curl", "fetch", "python"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        activeTab === tab
                          ? "bg-sky-600 text-white font-semibold"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      }`}
                    >
                      {tab === "curl" ? "cURL" : tab === "fetch" ? "Fetch / JS" : "Python"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <pre className="p-4 bg-[#020617] font-mono text-xs text-sky-300 overflow-x-auto leading-relaxed">
                  {activeTab === "curl" ? curlExample : activeTab === "fetch" ? fetchExample : pythonExample}
                </pre>
                <button
                  onClick={() =>
                    copyCode(
                      activeTab === "curl" ? curlExample : activeTab === "fetch" ? fetchExample : pythonExample,
                      "req-example"
                    )
                  }
                  className="absolute top-3 right-3 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1"
                >
                  {copied === "req-example" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copied === "req-example" ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            {/* Request Schema Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono text-slate-300 font-semibold uppercase tracking-wider">
                Request Body Schema
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono border border-[#1e293b] rounded">
                  <thead className="bg-[#090d16] text-slate-400 text-left border-b border-[#1e293b]">
                    <tr>
                      <th className="p-2.5">Field</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5">Required</th>
                      <th className="p-2.5">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e293b] text-slate-300">
                    <tr>
                      <td className="p-2.5 text-sky-400 font-semibold">type</td>
                      <td className="p-2.5 text-slate-400">string</td>
                      <td className="p-2.5 text-emerald-400">Yes</td>
                      <td className="p-2.5 text-slate-400">Event identifier (e.g. <code>LOGIN_FAILED</code>, <code>UNAUTHORIZED_ACCESS</code>)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-sky-400 font-semibold">userId</td>
                      <td className="p-2.5 text-slate-400">string</td>
                      <td className="p-2.5 text-slate-500">Optional</td>
                      <td className="p-2.5 text-slate-400">Target username, email, or account ID</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-sky-400 font-semibold">sourceIp</td>
                      <td className="p-2.5 text-slate-400">string</td>
                      <td className="p-2.5 text-slate-500">Optional</td>
                      <td className="p-2.5 text-slate-400">Client IP address from <code>x-forwarded-for</code> or remote socket</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-sky-400 font-semibold">endpoint</td>
                      <td className="p-2.5 text-slate-400">string</td>
                      <td className="p-2.5 text-slate-500">Optional</td>
                      <td className="p-2.5 text-slate-400">Target path (e.g. <code>/api/auth/login</code>)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-sky-400 font-semibold">metadata</td>
                      <td className="p-2.5 text-slate-400">object</td>
                      <td className="p-2.5 text-slate-500">Optional</td>
                      <td className="p-2.5 text-slate-400">Arbitrary contextual JSON key-values (reasons, payload snippets, counts)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 4: Supported Event Types */}
          <section id="event-types" className="space-y-4 pt-6 border-t border-[#1e293b] scroll-mt-24">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-sky-400" />
              <h2 className="text-lg font-bold text-slate-100 font-mono">
                4. Supported Event Types & Telemetry Format
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3.5 bg-[#090d16] border border-[#1e293b] rounded space-y-1">
                <div className="text-rose-400 font-bold flex items-center justify-between">
                  <span>LOGIN_FAILED</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">Auth</span>
                </div>
                <div className="text-slate-400 text-[11px]">Triggers brute-force correlation when failure bursts exceed 5 events in 60 seconds.</div>
              </div>

              <div className="p-3.5 bg-[#090d16] border border-[#1e293b] rounded space-y-1">
                <div className="text-emerald-400 font-bold flex items-center justify-between">
                  <span>LOGIN_SUCCESS</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">Auth</span>
                </div>
                <div className="text-slate-400 text-[11px]">Logged for authentication anomaly tracking & account takeover detection.</div>
              </div>

              <div className="p-3.5 bg-[#090d16] border border-[#1e293b] rounded space-y-1">
                <div className="text-amber-400 font-bold flex items-center justify-between">
                  <span>UNAUTHORIZED_ACCESS</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">Access</span>
                </div>
                <div className="text-slate-400 text-[11px]">Logged on HTTP 401/403 forbidden access attempts to admin endpoints.</div>
              </div>

              <div className="p-3.5 bg-[#090d16] border border-[#1e293b] rounded space-y-1">
                <div className="text-sky-400 font-bold flex items-center justify-between">
                  <span>ADMIN_ACCESS</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-800">Audit</span>
                </div>
                <div className="text-slate-400 text-[11px]">Tracks high-privilege configuration changes, user role upgrades, and data exports.</div>
              </div>

              <div className="p-3.5 bg-[#090d16] border border-[#1e293b] rounded space-y-1">
                <div className="text-orange-400 font-bold flex items-center justify-between">
                  <span>RATE_LIMIT_TRIGGERED</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-orange-950 text-orange-300 border border-orange-800">Rate Limit</span>
                </div>
                <div className="text-slate-400 text-[11px]">Signals repeated HTTP 429 Too Many Requests breaches or denial-of-service probes.</div>
              </div>

              <div className="p-3.5 bg-[#090d16] border border-[#1e293b] rounded space-y-1">
                <div className="text-red-400 font-bold flex items-center justify-between">
                  <span>SUSPICIOUS_REQUEST</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-800">WAF</span>
                </div>
                <div className="text-slate-400 text-[11px]">Flags injection probe patterns (SQLi, XSS, Path Traversal) caught by application filters.</div>
              </div>
            </div>
          </section>

          {/* Section 5: Defensive Detection Rules */}
          <section id="detection-rules" className="space-y-4 pt-6 border-t border-[#1e293b] scroll-mt-24">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-400" />
              <h2 className="text-lg font-bold text-slate-100 font-mono">
                5. Defensive Threat Detection Rules
              </h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              AegisScan's built-in detection engine automatically analyzes incoming event streams against predefined defensive correlation rules to trigger SOC incidents:
            </p>

            <div className="space-y-3">
              <div className="p-4 bg-[#090d16] border border-[#1e293b] rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs font-bold text-slate-200">
                    Rule 1: Brute-Force Spike Correlation
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                    CRITICAL SEVERITY
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Triggered when <code className="text-sky-300">&gt; 5 LOGIN_FAILED</code> events originate from the same IP address or target the same user account within a 60-second window. Creates an incident with evidence and suggested IP block remediations.
                </p>
              </div>

              <div className="p-4 bg-[#090d16] border border-[#1e293b] rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs font-bold text-slate-200">
                    Rule 2: Authentication Sequence Anomaly
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                    HIGH SEVERITY
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Triggered when multiple failed authentication attempts are immediately followed by a successful login from a different IP or device footprint (credential stuffing / account takeover).
                </p>
              </div>

              <div className="p-4 bg-[#090d16] border border-[#1e293b] rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs font-bold text-slate-200">
                    Rule 3: Injection Pattern Telemetry
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                    HIGH SEVERITY
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Matches query params against regex signatures for SQL injection (e.g. <code className="text-red-300">UNION SELECT</code>, <code className="text-red-300">OR 1=1</code>) and Cross-Site Scripting (<code className="text-red-300">&lt;script&gt;</code>, <code className="text-red-300">onerror=</code>).
                </p>
              </div>
            </div>
          </section>

          {/* Section 6: Node SDK Guide */}
          <section id="sdk-guide" className="space-y-4 pt-6 border-t border-[#1e293b] scroll-mt-24">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-sky-400" />
                <h2 className="text-lg font-bold text-slate-100 font-mono">
                  6. Node.js SDK (aegisscan-node)
                </h2>
              </div>
              <a
                href="https://www.npmjs.com/package/aegisscan-node"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono px-2.5 py-1 rounded bg-sky-950 border border-sky-800 text-sky-300 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>View on npmjs.com</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Package Install Tabs */}
            <div className="bg-[#090d16] border border-[#1e293b] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 font-semibold">Package Installation:</span>
                <div className="flex items-center gap-1">
                  {(["npm", "yarn", "pnpm", "bun"] as const).map((mgr) => (
                    <button
                      key={mgr}
                      onClick={() => setPkgTab(mgr)}
                      className={`px-2 py-0.5 rounded transition-colors ${
                        pkgTab === mgr
                          ? "bg-sky-600 text-white font-bold"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      }`}
                    >
                      {mgr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-[#1e293b] rounded font-mono text-xs text-sky-300 flex items-center justify-between">
                <code>{pkgCommands[pkgTab]}</code>
                <button
                  onClick={() => copyCode(pkgCommands[pkgTab], "pkg-cmd")}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  {copied === "pkg-cmd" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* SDK Code Snippet */}
            <div className="bg-[#090d16] border border-[#1e293b] rounded-lg overflow-hidden space-y-2">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e293b] bg-slate-950/60 text-xs font-mono text-slate-400">
                <span>Express / Backend Ingestion Hook</span>
                <button
                  onClick={() => copyCode(nodeSdkExample, "sdk-code")}
                  className="flex items-center gap-1 text-slate-300 hover:text-white"
                >
                  {copied === "sdk-code" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied === "sdk-code" ? "Copied" : "Copy Code"}</span>
                </button>
              </div>

              <pre className="p-4 bg-[#020617] font-mono text-xs text-sky-300 overflow-x-auto leading-relaxed">
                {nodeSdkExample}
              </pre>
            </div>

            {/* Next.js Middleware Example */}
            <div className="bg-[#090d16] border border-[#1e293b] rounded-lg overflow-hidden space-y-2">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e293b] bg-slate-950/60 text-xs font-mono text-slate-400">
                <span>Next.js Edge Middleware Protection Hook</span>
                <button
                  onClick={() => copyCode(middlewareExample, "mid-code")}
                  className="flex items-center gap-1 text-slate-300 hover:text-white"
                >
                  {copied === "mid-code" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied === "mid-code" ? "Copied" : "Copy Code"}</span>
                </button>
              </div>

              <pre className="p-4 bg-[#020617] font-mono text-xs text-sky-300 overflow-x-auto leading-relaxed">
                {middlewareExample}
              </pre>
            </div>

            {/* SDK Method Reference Table */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-mono text-slate-300 font-semibold uppercase tracking-wider">
                SDK Method Reference
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono border border-[#1e293b] rounded">
                  <thead className="bg-[#090d16] text-slate-400 text-left border-b border-[#1e293b]">
                    <tr>
                      <th className="p-2.5">Method</th>
                      <th className="p-2.5">Arguments</th>
                      <th className="p-2.5">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e293b] text-slate-300">
                    <tr>
                      <td className="p-2.5 text-sky-400 font-semibold">security.loginFailed(data)</td>
                      <td className="p-2.5 text-slate-400"><code>&#123; userId, sourceIp, endpoint, metadata &#125;</code></td>
                      <td className="p-2.5 text-slate-400">Sends a failed login attempt for brute-force tracking.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-sky-400 font-semibold">security.loginSuccess(data)</td>
                      <td className="p-2.5 text-slate-400"><code>&#123; userId, sourceIp, endpoint, metadata &#125;</code></td>
                      <td className="p-2.5 text-slate-400">Sends a successful login event for auth sequence analysis.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-sky-400 font-semibold">security.unauthorizedAccess(data)</td>
                      <td className="p-2.5 text-slate-400"><code>&#123; userId, sourceIp, endpoint, metadata &#125;</code></td>
                      <td className="p-2.5 text-slate-400">Flags HTTP 401/403 access control violations.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-sky-400 font-semibold">security.adminAccess(data)</td>
                      <td className="p-2.5 text-slate-400"><code>&#123; userId, sourceIp, endpoint, metadata &#125;</code></td>
                      <td className="p-2.5 text-slate-400">Logs administrative role and privileged actions.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-sky-400 font-semibold">security.rateLimitTriggered(data)</td>
                      <td className="p-2.5 text-slate-400"><code>&#123; sourceIp, endpoint, metadata &#125;</code></td>
                      <td className="p-2.5 text-slate-400">Flags rate limit breaches.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-sky-400 font-semibold">security.suspiciousRequest(data)</td>
                      <td className="p-2.5 text-slate-400"><code>&#123; sourceIp, endpoint, metadata &#125;</code></td>
                      <td className="p-2.5 text-slate-400">Reports detected SQLi/XSS malicious signatures.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 7: HTTP Status Codes */}
          <section id="error-codes" className="space-y-4 pt-6 border-t border-[#1e293b] scroll-mt-24">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-sky-400" />
              <h2 className="text-lg font-bold text-slate-100 font-mono">
                7. HTTP Status & Error Codes
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono border border-[#1e293b] rounded">
                <thead className="bg-[#090d16] text-slate-400 text-left border-b border-[#1e293b]">
                  <tr>
                    <th className="p-2.5">Status Code</th>
                    <th className="p-2.5">Meaning</th>
                    <th className="p-2.5">Resolution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b] text-slate-300">
                  <tr>
                    <td className="p-2.5 text-emerald-400 font-bold">200 OK</td>
                    <td className="p-2.5 text-slate-300">Event successfully ingested and queued for threat correlation.</td>
                    <td className="p-2.5 text-slate-400">No action needed.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-amber-400 font-bold">400 Bad Request</td>
                    <td className="p-2.5 text-slate-300">Missing required field <code>type</code> or invalid JSON payload.</td>
                    <td className="p-2.5 text-slate-400">Verify request body matches JSON format.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-rose-400 font-bold">401 Unauthorized</td>
                    <td className="p-2.5 text-slate-300">Missing or invalid Bearer API key.</td>
                    <td className="p-2.5 text-slate-400">Ensure header has <code>Authorization: Bearer aeg_live_...</code>.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-rose-400 font-bold">403 Forbidden</td>
                    <td className="p-2.5 text-slate-300">API Key is inactive or revoked.</td>
                    <td className="p-2.5 text-slate-400">Generate a fresh API key in Project settings.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-orange-400 font-bold">429 Too Many Requests</td>
                    <td className="p-2.5 text-slate-300">Telemetry ingestion rate limit exceeded.</td>
                    <td className="p-2.5 text-slate-400">Batch events or implement exponential backoff.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
