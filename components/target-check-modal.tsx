"use client";

import React, { useState } from "react";
import { ShieldCheck, AlertCircle, Loader2 } from "lucide-react";

interface TargetCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TargetCheckModal({ isOpen, onClose, onSuccess }: TargetCheckModalProps) {
  const [name, setName] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [description, setDescription] = useState("");
  const [ownershipConfirmed, setOwnershipConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownershipConfirmed) {
      setError("You must confirm ownership/authorization before registering a target.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          targetUrl,
          description: description || undefined,
          ownershipConfirmed: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create project");
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating project";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#090d16] border border-[#1e293b] rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-start justify-between border-b border-[#1e293b] pb-3">
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
              Register Target Application
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Add a web application for defensive security posture assessments.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm font-mono"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-900/40 rounded flex items-center gap-2 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Application Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Production Billing Service"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#020617] border border-[#1e293b] focus:border-sky-500 rounded px-3 py-2 text-slate-200 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Target URL (HTTP/HTTPS) *</label>
            <input
              type="url"
              required
              placeholder="https://example.com"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full bg-[#020617] border border-[#1e293b] focus:border-sky-500 rounded px-3 py-2 text-slate-200 focus:outline-none font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Protected by SSRF guard: Localhost, private RFC1918 IPs, and cloud metadata endpoints are strictly prohibited.
            </p>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Brief description of application scope..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#020617] border border-[#1e293b] focus:border-sky-500 rounded px-3 py-2 text-slate-200 focus:outline-none"
            />
          </div>

          {/* Explicit Authorization Confirmation Checkbox */}
          <div className="p-3 bg-slate-950 border border-sky-900/40 rounded space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={ownershipConfirmed}
                onChange={(e) => setOwnershipConfirmed(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-sky-600 focus:ring-0"
              />
              <span className="text-[11px] text-slate-300 leading-relaxed font-medium">
                I confirm that I own this application or have explicit authorization to perform security assessments against it.
              </span>
            </label>
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
              disabled={loading || !ownershipConfirmed}
              className="px-4 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Register Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
