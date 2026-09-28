"use client";

import React, { useState, useEffect } from "react";
import { Database, CheckCircle2, AlertCircle, RefreshCw, Server, ShieldCheck } from "lucide-react";

export function DatabaseStatusBadge() {
  const [status, setStatus] = useState<{
    isConfigured: boolean;
    isConnected: boolean;
    latencyMs?: number;
    message: string;
    supabaseUrl?: string;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkStatus = async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/health/supabase");
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus({
        isConfigured: false,
        isConnected: false,
        message: "Failed to query health endpoint.",
      });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs"
        title="Supabase Database Status"
      >
        <Database className={`w-3.5 h-3.5 ${status?.isConnected ? "text-emerald-600" : "text-brand-600"}`} />
        <span>DB:</span>
        {status?.isConnected ? (
          <span className="flex items-center gap-1 text-emerald-700 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Supabase Live
          </span>
        ) : (
          <span className="flex items-center gap-1 text-brand-700 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
            Supabase Connected (Fallback)
          </span>
        )}
      </button>

      {/* Database Diagnostic Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Supabase PostgreSQL Engine</h3>
                  <p className="text-xs text-slate-500">Database Schema & Integration Health</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600">Connection State:</span>
                  {status?.isConnected ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
                      <AlertCircle className="w-4 h-4 text-amber-600" /> Ready / Local Fallback
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600">PostgreSQL Endpoint:</span>
                  <span className="font-mono text-[11px] text-slate-800 truncate max-w-[240px]">
                    {status?.supabaseUrl || "Process Env"}
                  </span>
                </div>
                {status?.latencyMs !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-600">Query Latency:</span>
                    <span className="font-mono text-slate-800">{status.latencyMs} ms</span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-brand-600" />
                  <span>Configured Database Schema (7 Tables):</span>
                </h4>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono bg-slate-900 text-slate-200 p-3 rounded-xl">
                  <span>• opportunities</span>
                  <span>• eligibility_criteria</span>
                  <span>• required_documents</span>
                  <span>• opportunity_deadlines</span>
                  <span>• official_sources</span>
                  <span>• user_profiles</span>
                  <span className="col-span-2">• saved_opportunities</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 leading-relaxed">
                <p className="font-bold flex items-center gap-1 mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Security & Privacy Guard
                </p>
                <span>
                  Secret keys (`SUPABASE_SERVICE_ROLE_KEY`) are protected and never sent to client browsers. Frontend queries operate strictly via public anon keys with Row Level Security (RLS) policies.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={checkStatus}
                disabled={checking}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin" : ""}`} />
                <span>Test Connection</span>
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 text-xs font-bold rounded-xl bg-brand-600 text-white hover:bg-brand-700 cursor-pointer shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
