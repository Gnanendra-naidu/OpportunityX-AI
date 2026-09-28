"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Opportunity,
  VerificationStatus,
  OpportunityType,
} from "@/types";
import { useAdminAuth, DEMO_ADMIN_PASSKEY, DEMO_ADMIN_EMAIL } from "@/hooks/useAdminAuth";
import {
  getAdminLocalOpportunities,
  updateOpportunityStatus,
  deleteOpportunityRecord,
  resetAdminDataset,
} from "@/lib/admin/opportunityManager";
import { OpportunityEditorModal } from "@/components/admin/OpportunityEditorModal";
import { OpportunityDetailModal } from "@/components/details/OpportunityDetailModal";
import { VerificationStatusBadge } from "@/components/common/VerificationStatusBadge";
import { DeadlineBadge } from "@/components/common/DeadlineBadge";
import {
  ShieldAlert,
  ShieldCheck,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Key,
  Database,
  ExternalLink,
  Eye,
  Building,
  MapPin,
  Calendar,
  FileText,
  LogOut,
  Info,
  Sparkles,
} from "lucide-react";

export default function AdminManagementPage() {
  const {
    isAdmin,
    isLoading: isAuthLoading,
    adminUser,
    error: authError,
    loginAsAdmin,
    loginWithAdminAccount,
    logoutAdmin,
  } = useAdminAuth();

  // Passkey input state for gate
  const [passkeyInput, setPasskeyInput] = useState("");
  const [passkeyError, setPasskeyError] = useState<string | null>(null);

  // Opportunities State
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoadingOpps, setIsLoadingOpps] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Modals
  const [editorOpp, setEditorOpp] = useState<Opportunity | null | undefined>(undefined);
  // undefined: closed; null: create new; Opportunity: edit existing
  const [previewOpp, setPreviewOpp] = useState<Opportunity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Opportunity | null>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reload opportunities
  const loadOpportunities = () => {
    setIsLoadingOpps(true);
    try {
      const data = getAdminLocalOpportunities();
      setOpportunities(data);
    } catch (err) {
      console.error("Failed to load admin opportunities:", err);
    } finally {
      setIsLoadingOpps(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadOpportunities();
    }
  }, [isAdmin]);

  // Filtered Opportunities
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = opp.title.toLowerCase().includes(q);
        const matchProvider = (opp.provider || opp.providerName).toLowerCase().includes(q);
        const matchState = (opp.state || opp.stateJurisdiction).toLowerCase().includes(q);
        const matchId = opp.id.toLowerCase().includes(q);
        if (!matchTitle && !matchProvider && !matchState && !matchId) {
          return false;
        }
      }

      if (statusFilter !== "all") {
        if (statusFilter === "under_review") {
          if (opp.verificationStatus !== "under_review" && opp.verificationStatus !== "source_updated") {
            return false;
          }
        } else if (opp.verificationStatus !== statusFilter) {
          return false;
        }
      }

      if (typeFilter !== "all" && opp.type !== typeFilter) {
        return false;
      }

      return true;
    });
  }, [opportunities, searchQuery, statusFilter, typeFilter]);

  // Metrics
  const stats = useMemo(() => {
    const total = opportunities.length;
    let verified = 0;
    let needsVerification = 0;
    let unverified = 0;
    let scholarships = 0;
    let schemes = 0;

    opportunities.forEach((o) => {
      if (o.verificationStatus === "verified") verified++;
      else if (o.verificationStatus === "under_review" || o.verificationStatus === "source_updated") needsVerification++;
      else unverified++;

      if (o.type === "scholarship" || o.type === "fellowship") scholarships++;
      else if (o.type === "scheme") schemes++;
    });

    return { total, verified, needsVerification, unverified, scholarships, schemes };
  }, [opportunities]);

  // Actions
  const handleQuickStatusChange = async (id: string, newStatus: VerificationStatus) => {
    const res = await updateOpportunityStatus(id, newStatus);
    if (res.success) {
      setOpportunities((prev) =>
        prev.map((o) =>
          o.id === id
            ? { ...o, verificationStatus: newStatus, isVerified: newStatus === "verified" }
            : o
        )
      );
      setToastMessage(`Updated verification status to: ${newStatus.toUpperCase()}`);
      setTimeout(() => setToastMessage(null), 3000);
    } else {
      setToastMessage(`Error: ${res.error}`);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const res = await deleteOpportunityRecord(deleteTarget.id);
    if (res.success) {
      setOpportunities((prev) => prev.filter((o) => o.id !== deleteTarget.id));
      setToastMessage(`Deleted opportunity "${deleteTarget.title.substring(0, 30)}..."`);
      setTimeout(() => setToastMessage(null), 3500);
    }
    setDeleteTarget(null);
  };

  const handleResetDefaults = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all opportunity records back to default mock dataset? Any custom additions or edits will be cleared."
      )
    ) {
      resetAdminDataset();
      loadOpportunities();
      setToastMessage("Dataset reset to factory defaults.");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handlePasskeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasskeyError(null);
    const success = loginAsAdmin(passkeyInput);
    if (!success) {
      setPasskeyError("Invalid passkey. Normal public users cannot access this demo admin console.");
    }
  };

  const handleOneClickDemoAdmin = () => {
    setPasskeyInput(DEMO_ADMIN_PASSKEY);
    loginAsAdmin(DEMO_ADMIN_PASSKEY);
  };

  // ─────────────────────────────────────────────────────────────
  // 1. ACCESS CONTROL: PUBLIC USER RESTRICTION GATE
  // ─────────────────────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white max-w-lg w-full rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>

          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
              <span>Restricted Demo Interface</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Administrator Management Console
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              Normal public users and scholarship seekers cannot access admin management controls. Please authenticate using the designated hackathon evaluation passkey.
            </p>
          </div>

          {/* Hackathon Demo Notice */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>For Hackathon Judges & Evaluators:</span>
            </span>
            <p className="text-[11px] text-slate-500 leading-normal">
              Click below to unlock the demo admin sandbox with pre-configured evaluation privileges:
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleOneClickDemoAdmin}
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>Enter Hackathon Demo Admin Session (One-Click)</span>
              </button>
            </div>
          </div>

          {/* Manual Passkey Entry */}
          <form onSubmit={handlePasskeySubmit} className="space-y-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Enter Demo Admin Passkey
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  placeholder={`Default: ${DEMO_ADMIN_PASSKEY}`}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>
            </div>

            {(passkeyError || authError) && (
              <p className="text-xs text-rose-600 font-medium">
                {passkeyError || authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Verify Passkey & Access Console
            </button>
          </form>

          <div className="text-center pt-2">
            <Link
              href="/"
              className="text-xs font-bold text-brand-600 hover:underline inline-flex items-center gap-1"
            >
              ← Return to Citizen Discovery Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. AUTHENTICATED DEMO ADMIN INTERFACE
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          CLEAR HACKATHON DEMO / ADMIN ENVIRONMENT BANNER
          ───────────────────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md border border-indigo-900/60 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-400/30 text-[10px] font-black uppercase tracking-wider">
              🧪 Hackathon Demo Management Sandbox
            </span>
            <span className="text-xs text-slate-300 font-mono">
              Session: {adminUser?.email || DEMO_ADMIN_EMAIL}
            </span>
          </div>

          <button
            type="button"
            onClick={logoutAdmin}
            className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Admin Mode</span>
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          <strong>Notice:</strong> This console is a clearly identified prototype sandbox for OpportunityX-AI administrators and hackathon jury members to manage, review, and test opportunity records. It is <strong>NOT</strong> an official sovereign government portal.
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          HEADER & MAIN ACTIONS
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Opportunity & Scheme Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Create, edit, verify, and audit welfare schemes and scholarships. All changes immediately sync with the public discovery engine and AI matching system.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Reset dataset back to factory defaults"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => setEditorOpp(null)}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-colors shadow-2xs flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Opportunity</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          METRICS OVERVIEW
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Opportunities
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {stats.total}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {stats.scholarships} Scholarships • {stats.schemes} Schemes
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            Verified Sovereign
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
            {stats.verified}
          </div>
          <div className="text-[11px] text-emerald-700/80 mt-0.5">
            Nodal portal cross-checked
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
            Needs Verification
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 mt-1">
            {stats.needsVerification}
          </div>
          <div className="text-[11px] text-amber-700/80 mt-0.5">
            Pending document check
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
            Unverified / Demo
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-700 mt-1">
            {stats.unverified}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Prototype demo records
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SEARCH & FILTER BAR
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, provider, state, or ID..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Verification Statuses</option>
              <option value="verified">Verified Only</option>
              <option value="under_review">Needs Verification (Under Review)</option>
              <option value="unverified">Unverified / Demo Only</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Types</option>
              <option value="scholarship">Scholarship</option>
              <option value="scheme">Government Scheme</option>
              <option value="fellowship">Fellowship</option>
              <option value="skill_training">Skill Training</option>
              <option value="grant">Grant</option>
              <option value="subsidy">Subsidy</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Showing <strong>{filteredOpportunities.length}</strong> of{" "}
            <strong>{opportunities.length}</strong> opportunities
          </span>

          {(searchQuery || statusFilter !== "all" || typeFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setTypeFilter("all");
              }}
              className="text-brand-600 hover:text-brand-700 font-semibold cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          OPPORTUNITY MANAGEMENT TABLE / LIST
          ───────────────────────────────────────────────────────────── */}
      {filteredOpportunities.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Database className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">
            No opportunities match your search
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try resetting your search query or loosening the status filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOpportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-all space-y-3"
            >
              {/* Header Row: Title, Badges, and Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                      {opp.type.replace("_", " ")}
                    </span>
                    <VerificationStatusBadge status={opp.verificationStatus} size="sm" />
                    <DeadlineBadge opportunity={opp} variant="badge" />
                    <span className="text-[10px] font-mono text-slate-400">
                      ID: {opp.id}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {opp.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{opp.providerName || opp.provider}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{opp.stateJurisdiction || opp.state}</span>
                    </span>
                    <span>•</span>
                    <span>Benefit: <strong>{opp.financialAmount || opp.amount}</strong></span>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => setPreviewOpp(opp)}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors"
                    title="Preview Citizen View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditorOpp(opp)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-brand-50 hover:border-brand-300 text-slate-700 hover:text-brand-700 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(opp)}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:border-rose-300 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Delete Opportunity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status & Official Source Bar */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Fast Inline Status Changer */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Change Status:
                  </span>
                  <select
                    value={opp.verificationStatus}
                    onChange={(e) =>
                      handleQuickStatusChange(opp.id, e.target.value as VerificationStatus)
                    }
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
                  >
                    <option value="verified">✅ Verified Sovereign</option>
                    <option value="under_review">⚠️ Needs Verification</option>
                    <option value="unverified">🧪 Unverified / Demo</option>
                  </select>
                </div>

                {/* Official Source & Documents Summary */}
                <div className="flex items-center gap-4 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>{opp.documents?.length || 0} Required Docs</span>
                  </span>

                  <a
                    href={opp.officialWebsite || opp.officialSource?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    <span>{opp.officialSource?.portalName || "Official Portal"}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. OPPORTUNITY EDITOR MODAL (ADD / EDIT)
          ───────────────────────────────────────────────────────────── */}
      {editorOpp !== undefined && (
        <OpportunityEditorModal
          opportunity={editorOpp}
          onClose={() => setEditorOpp(undefined)}
          onSaved={(savedOpp) => {
            setEditorOpp(undefined);
            loadOpportunities();
            setToastMessage(`Successfully saved "${savedOpp.title.substring(0, 30)}..."`);
            setTimeout(() => setToastMessage(null), 3500);
          }}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. CITIZEN VIEW PREVIEW MODAL
          ───────────────────────────────────────────────────────────── */}
      {previewOpp && (
        <OpportunityDetailModal
          opportunity={previewOpp}
          onClose={() => setPreviewOpp(null)}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. DELETE CONFIRMATION DIALOG
          ───────────────────────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Confirm Opportunity Deletion
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete{" "}
                <strong>"{deleteTarget.title}"</strong> (ID:{" "}
                <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono">
                  {deleteTarget.id}
                </code>
                )? This action will remove it from the catalog and search results.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Yes, Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
