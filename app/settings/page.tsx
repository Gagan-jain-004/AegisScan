"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { ApiKeyModal } from "@/components/api-key-modal";
import { Settings, KeyRound, User, Shield, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { ApiKey, Project, UserProfile } from "@/lib/types";
import { useUser } from "@clerk/nextjs";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "api-keys" | "security">("profile");
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const { user: clerkUser } = useUser();

  const fetchData = async () => {
    try {
      const [keysRes, projRes] = await Promise.all([
        fetch("/api/api-keys").then((r) => r.json()),
        fetch("/api/projects").then((r) => r.json()),
      ]);
      setApiKeys(keysRes.keys || []);
      setProjects(projRes.projects || []);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRevoke = async (keyId: string) => {
    if (!confirm("Are you sure you want to revoke this API key?")) return;
    try {
      await fetch("/api/api-keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId }),
      });
      fetchData();
    } catch {
      // Ignore
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 max-w-5xl">
          {/* Header */}
          <div className="border-b border-[#1e293b] pb-5 space-y-3">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-sky-400" />
              <h1 className="text-xl font-bold tracking-tight text-slate-100">
                Workspace & Security Settings
              </h1>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#1e293b]/60 text-xs font-medium text-slate-400">
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-3 py-1.5 rounded transition-colors ${
                  activeTab === "profile" ? "bg-slate-800 text-slate-100 font-semibold" : "hover:text-slate-200"
                }`}
              >
                Profile & Access
              </button>
              <button
                onClick={() => setActiveTab("api-keys")}
                className={`px-3 py-1.5 rounded transition-colors ${
                  activeTab === "api-keys" ? "bg-slate-800 text-slate-100 font-semibold" : "hover:text-slate-200"
                }`}
              >
                API Keys ({apiKeys.length})
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`px-3 py-1.5 rounded transition-colors ${
                  activeTab === "security" ? "bg-slate-800 text-slate-100 font-semibold" : "hover:text-slate-200"
                }`}
              >
                Security Engine
              </button>
            </div>
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="bg-[#090d16] border border-[#1e293b] rounded-lg p-5 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400 font-bold text-lg">
                  {clerkUser?.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={clerkUser.imageUrl} alt="Profile" className="w-14 h-14 rounded-full" />
                  ) : (
                    <User className="w-7 h-7" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-100">
                    {clerkUser?.fullName || clerkUser?.username || "Lead Security Administrator"}
                  </h3>
                  <div className="text-xs font-mono text-slate-400">
                    {clerkUser?.primaryEmailAddress?.emailAddress || "admin@aegisscan.dev"}
                  </div>
                  <div className="inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded bg-sky-950 border border-sky-800 text-sky-400 text-[10px] font-mono uppercase font-semibold">
                    <span>Full Administrator Access</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1e293b] space-y-2 text-xs">
                <div className="text-slate-300 font-medium">Access Privileges</div>
                <div className="p-3 bg-[#020617] border border-[#1e293b] rounded text-slate-400 font-mono text-[11px] leading-relaxed">
                  ✓ Full authority to register, scan, and delete target applications<br />
                  ✓ Generate and revoke Ingestion API Keys<br />
                  ✓ Triage findings, resolve security incidents, and write investigation notes<br />
                  ✓ Export official Executive Security Assessment Reports
                </div>
              </div>
            </div>
          )}

          {/* API Keys Tab */}
          {activeTab === "api-keys" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">Global Ingestion Keys</h3>
                  <p className="text-xs text-slate-400">Active cryptographic keys for external telemetry ingestion.</p>
                </div>
                <button
                  onClick={() => setIsKeyModalOpen(true)}
                  className="px-3.5 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Generate Key
                </button>
              </div>

              {apiKeys.length === 0 ? (
                <div className="p-8 bg-[#090d16] border border-[#1e293b] rounded text-center text-xs text-slate-500 font-mono">
                  No API keys generated yet.
                </div>
              ) : (
                <div className="bg-[#090d16] border border-[#1e293b] rounded-lg divide-y divide-[#1e293b]">
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
                          onClick={() => handleRevoke(k.id)}
                          className="px-2.5 py-1 rounded border border-rose-900/50 hover:bg-rose-950 text-rose-400 text-xs font-mono"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="bg-[#090d16] border border-[#1e293b] rounded-lg p-5 space-y-4 text-xs">
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <Shield className="w-4 h-4 text-sky-400" />
                <span>Security Engine Hardening Controls</span>
              </div>

              <div className="space-y-3 font-mono text-[11px] text-slate-400">
                <div className="flex items-center justify-between p-2.5 bg-[#020617] rounded border border-[#1e293b]">
                  <span>Server-Side Request Forgery (SSRF) Guard</span>
                  <span className="text-emerald-400">ACTIVE (Private IPs & Cloud Metadata Blocked)</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-[#020617] rounded border border-[#1e293b]">
                  <span>API Key Hashing Standard</span>
                  <span className="text-emerald-400">SHA-256 One-Way Salted Digest</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-[#020617] rounded border border-[#1e293b]">
                  <span>Audit Trail Immutability</span>
                  <span className="text-emerald-400">APPEND-ONLY SECURED</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <ApiKeyModal
        isOpen={isKeyModalOpen}
        projects={projects}
        onClose={() => setIsKeyModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
