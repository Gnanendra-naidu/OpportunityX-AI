"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MOCK_OPPORTUNITIES, STATES_LIST, DEMO_DATA_NOTICE } from "@/data/mockOpportunities";
import { LIFE_STAGES } from "@/data/lifeStages";
import { Opportunity, LifeStageKey } from "@/types";
import { OpportunityCard } from "@/components/cards/OpportunityCard";
import { OpportunityDetailModal } from "@/components/details/OpportunityDetailModal";
import { VerificationStatusBadge } from "@/components/common/VerificationStatusBadge";
import { useOpportunities } from "@/hooks/useOpportunities";
import { useSaved } from "@/context/SavedContext";
import {
  MapPin,
  Landmark,
  ShieldCheck,
  AlertTriangle,
  Building,
  Filter,
  Layers,
  Sparkles,
  Search,
  ExternalLink,
  Info,
  CheckCircle2,
  SlidersHorizontal,
  Database,
  Loader2,
} from "lucide-react";

function StatesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Selected State state (default to Karnataka or query param)
  const initialSelectedState = searchParams.get("state") || "Karnataka";
  const [selectedState, setSelectedState] = useState<string>(initialSelectedState);
  const [stateSearchQuery, setStateSearchQuery] = useState<string>("");

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [lifeStageFilter, setLifeStageFilter] = useState<string>("");

  // Detail Modal & Saved state
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const { savedIds, toggleSave } = useSaved();

  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    router.push(`/states?state=${encodeURIComponent(stateName)}`, { scroll: false });
  };

  // Supabase dynamic opportunity loader
  const { opportunities: allOpportunities, isLoading, dataSource } = useOpportunities();

  // State-specific opportunities: Strictly for this state (NOT Central)
  const stateSpecificOpportunities = useMemo(() => {
    return allOpportunities.filter((opp) => {
      const isStateMatch =
        opp.state === selectedState || opp.stateJurisdiction === selectedState;
      const isNotCentral =
        opp.state !== "All India (Central)" &&
        opp.stateJurisdiction !== "All India (Central)";

      if (!isStateMatch || !isNotCentral) return false;

      // Category filter
      if (categoryFilter && !opp.category.toLowerCase().includes(categoryFilter.toLowerCase())) {
        return false;
      }

      // Life Stage filter
      if (lifeStageFilter) {
        const stages = opp.lifeStages || opp.targetLifeStages || [];
        if (!stages.includes(lifeStageFilter as LifeStageKey)) {
          return false;
        }
      }

      return true;
    });
  }, [allOpportunities, selectedState, categoryFilter, lifeStageFilter]);

  // Central opportunities: Pan-India (applies nationwide including this state)
  const centralOpportunities = useMemo(() => {
    return allOpportunities.filter((opp) => {
      const isCentral =
        opp.state === "All India (Central)" ||
        opp.stateJurisdiction === "All India (Central)";

      if (!isCentral) return false;

      // Category filter
      if (categoryFilter && !opp.category.toLowerCase().includes(categoryFilter.toLowerCase())) {
        return false;
      }

      // Life Stage filter
      if (lifeStageFilter) {
        const stages = opp.lifeStages || opp.targetLifeStages || [];
        if (!stages.includes(lifeStageFilter as LifeStageKey)) {
          return false;
        }
      }

      return true;
    });
  }, [allOpportunities, categoryFilter, lifeStageFilter]);

  // Filtered states list for search
  const filteredStatesList = useMemo(() => {
    return STATES_LIST.filter(
      (s) =>
        s.name !== "All India (Central)" &&
        s.name.toLowerCase().includes(stateSearchQuery.toLowerCase())
    );
  }, [stateSearchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24 lg:pb-12 space-y-10">
      {/* ─────────────────────────────────────────────────────────────
          PAGE HEADER
          ───────────────────────────────────────────────────────────── */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2 border border-emerald-200 shadow-2xs">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>Geographic Welfare Discovery</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          State-Wise Opportunity & Scheme Discovery
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
          Discover opportunities tailored to your state of residence. State-level welfare schemes and Pan-India Central Government programs are strictly separated to ensure legal domicile transparency.
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          STATE SELECTOR INTERFACE
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Your State or Union Territory
            </label>
            <p className="text-xs text-slate-500 mt-0.5">
              Current Active Jurisdiction: <strong className="text-brand-700 text-sm">{selectedState}</strong>
            </p>
          </div>

          {/* Quick Search State Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={stateSearchQuery}
              onChange={(e) => setStateSearchQuery(e.target.value)}
              placeholder="Find state (e.g. Karnataka, UP)..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Quick State Pills */}
        <div className="flex flex-wrap gap-2 pt-1 max-h-36 overflow-y-auto pr-1">
          {filteredStatesList.map((st) => {
            const isSelected = st.name === selectedState;
            return (
              <button
                key={st.code}
                type="button"
                onClick={() => handleStateChange(st.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-brand-600 text-white shadow-sm ring-2 ring-brand-300"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>{st.name}</span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CATEGORY & LIFE-STAGE FILTERS BAR
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-brand-600" />
            <span>Filter Schemes:</span>
          </span>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="py-1.5 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500 shadow-2xs"
          >
            <option value="">All Categories / Missions</option>
            <option value="Education">Higher Education & Scholarships</option>
            <option value="Agriculture">Agriculture & Farmers Support</option>
            <option value="Women">Women Empowerment & Girl Child</option>
            <option value="Social">Social Welfare & Security</option>
            <option value="Enterprise">Micro-Enterprises & Self Employment</option>
          </select>

          {/* Life Stage Filter */}
          <select
            value={lifeStageFilter}
            onChange={(e) => setLifeStageFilter(e.target.value)}
            className="py-1.5 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500 shadow-2xs"
          >
            <option value="">All Life Stages</option>
            {LIFE_STAGES.map((ls) => (
              <option key={ls.key} value={ls.key}>
                {ls.title} ({ls.ageRange})
              </option>
            ))}
          </select>

          {isLoading ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
              <Loader2 className="w-3 h-3 animate-spin text-brand-600" />
              <span>Syncing DB...</span>
            </span>
          ) : (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                dataSource === "supabase"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-white text-slate-700 border-slate-200"
              }`}
            >
              <Database className="w-3 h-3 text-brand-600" />
              <span>{dataSource === "supabase" ? "Supabase Live" : "Supabase Engine"}</span>
            </span>
          )}
        </div>

        {(categoryFilter || lifeStageFilter) && (
          <button
            type="button"
            onClick={() => {
              setCategoryFilter("");
              setLifeStageFilter("");
            }}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline self-end md:self-auto"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION A: STATE-SPECIFIC OPPORTUNITIES (EXCLUSIVE TO STATE)
          ───────────────────────────────────────────────────────────── */}
      <section className="space-y-5">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-white flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-950">
                A. State-Specific Schemes: {selectedState} ({stateSpecificOpportunities.length})
              </h2>
              <p className="text-xs text-amber-800 mt-0.5">
                <strong>Legal Domicile Notice:</strong> These welfare programs are funded exclusively by the Government of {selectedState} and apply <em>only to bonafide residents/domiciliaries of {selectedState}</em>. They do NOT apply nationwide.
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 whitespace-nowrap self-start sm:self-auto">
            State Domicile Mandatory
          </span>
        </div>

        {stateSpecificOpportunities.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
            <Building className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">
              No state-specific schemes linked for {selectedState} under current filters
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              You can still benefit from all nationwide Central Government schemes listed in Section B below.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stateSpecificOpportunities.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                isSaved={savedIds.includes(opp.id)}
                onToggleSave={toggleSave}
                onOpenDetails={(item) => setSelectedOpportunity(item)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION B: PAN-INDIA CENTRAL OPPORTUNITIES
          ───────────────────────────────────────────────────────────── */}
      <section className="space-y-5 pt-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-600 text-white flex-shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-blue-950">
                B. Pan-India Central Government Opportunities ({centralOpportunities.length})
              </h2>
              <p className="text-xs text-blue-800 mt-0.5">
                Centrally funded initiatives administered by Government of India Ministries. Open to all eligible Indian citizens residing in {selectedState} and across all States/UTs.
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-300 whitespace-nowrap self-start sm:self-auto">
            All India (Central)
          </span>
        </div>

        {centralOpportunities.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
            <p className="text-xs text-slate-500">
              No central schemes match the current category or life-stage filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {centralOpportunities.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                isSaved={savedIds.includes(opp.id)}
                onToggleSave={toggleSave}
                onOpenDetails={(item) => setSelectedOpportunity(item)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          COMPREHENSIVE 8-SECTION OPPORTUNITY DETAIL MODAL
          ───────────────────────────────────────────────────────────── */}
      <OpportunityDetailModal
        opportunity={selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
        isSaved={selectedOpportunity ? savedIds.includes(selectedOpportunity.id) : false}
        onToggleSave={toggleSave}
      />
    </div>
  );
}

export default function StatesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading State Discovery...</div>}>
      <StatesPageContent />
    </Suspense>
  );
}
