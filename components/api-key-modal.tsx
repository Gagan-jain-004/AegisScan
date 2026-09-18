"use client";

import React, { useState } from "react";
import { KeyRound, Copy, Check, AlertTriangle, Loader2 } from "lucide-react";
import { Project } from "@/lib/types";

interface ApiKeyModalProps {
  isOpen: boolean;
  projects: Project[];
  onClose: () => void;
  onSuccess: () => void;
}

export function ApiKeyModal({ isOpen, projects, onClose, onSuccess }: ApiKeyModalProps) {
  const [projectId, setProjectId] = useState(projects[0]?.id || "");
  const [name, setName] = useState("");
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, name }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate API Key");
      }

      setRawKey(data.rawKey);
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Key generation error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (rawKey) {
      navigator.clipboard.writeText(rawKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#090d16] border border-[#1e293b] rounded-lg max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-start justify-between border-b border-[#1e293b] pb-3">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-semibold text-slate-100">
              {rawKey ? "API Key Generated" : "Generate Ingestion API Key"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm font-mono"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-900/40 rounded text-xs text-rose-400">
            {error}
          </div>
        )}

        {rawKey ? (
          <div className="space-y-4">
            <div className="p-3 bg-yellow-950/30 border border-yellow-800/50 rounded flex items-start gap-2.5 text-xs text-yellow-300">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                <strong>Copy this key now.</strong> For your security, this key will never be shown again.
              </p>
            </div>

            <div>
              <label className="block text-slate-400 text-xs mb-1 font-mono">Secret Key</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={rawKey}
                  className="w-full bg-[#020617] border border-sky-800/60 rounded px-3 py-2 text-xs font-mono text-sky-300 focus:outline-none select-all"
                />
                <button
                  onClick={handleCopy}
                  className="px-3 py-2 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono flex items-center gap-1 shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#1e293b]">
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleGenerate} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Target Project</label>
              <select
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-[#020617] border border-[#1e293b] focus:border-sky-500 rounded px-3 py-2 text-slate-200 focus:outline-none"
              >
                {projects.length === 0 ? (
                  <option value="">No projects registered</option>
                ) : (
                  projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Key Name / Description</label>
              <input
                type="text"
                required
                placeholder="e.g. Production WAF Ingestion Key"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#020617] border border-[#1e293b] focus:border-sky-500 rounded px-3 py-2 text-slate-200 focus:outline-none font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e293b]">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded border border-[#1e293b] text-slate-300 hover:bg-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !projectId || !name}
                className="px-4 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Generate Key
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
