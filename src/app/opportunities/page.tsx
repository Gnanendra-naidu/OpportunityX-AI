"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/common/SearchBar";
import { OpportunityCard } from "@/components/cards/OpportunityCard";
import { OpportunityDetailModal } from "@/components/details/OpportunityDetailModal";
import { FilterPanel } from "@/components/common/FilterPanel";
import { EligibilitySection } from "@/components/details/EligibilitySection";
import { RequiredDocumentsSection } from "@/components/details/RequiredDocumentsSection";
import { OfficialSourceSection } from "@/components/details/OfficialSourceSection";
import { DEMO_DATA_NOTICE } from "@/data/mockOpportunities";
import { Opportunity, FilterState } from "@/types";
import { useOpportunities } from "@/hooks/useOpportunities";
import {
  Layers,
  X,
  ExternalLink,
  ShieldAlert,
  SlidersHorizontal,
  BookmarkCheck,
  CheckCircle,
  Database,
  Loader2,
} from "lucide-react";

import { OpportunityCardSkeleton } from "@/components/common/OpportunityCardSkeleton";
import { EmptyState } from "@/components/common/EmptyState";

function OpportunitiesContent() {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: searchParams.get("q") || "",
    lifeStage: searchParams.get("stage") || "",
    type: searchParams.get("type") || "",
    state: searchParams.get("state") || "",
    casteCategory: searchParams.get("category") || "",
    gender: searchParams.get("gender") || "",
    maxIncome: "",
  });

  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Supabase dynamic opportunity loader
  const { opportunities: allOpportunities, isLoading, dataSource } = useOpportunities();

  // Check URL query parameters on initial load and navigation updates
  useEffect(() => {
    const q = searchParams.get("q");
    const stage = searchParams.get("stage");
    const type = searchParams.get("type");
    const state = searchParams.get("state");
    const category = searchParams.get("category");
    const gender = searchParams.get("gender");

    setFilters((prev) => ({
      ...prev,
      searchQuery: q !== null ? q : prev.searchQuery,
      lifeStage: stage !== null ? stage : prev.lifeStage,
      type: type !== null ? type : prev.type,
      state: state !== null ? state : prev.state,
      casteCategory: category !== null ? category : prev.casteCategory,
      gender: gender !== null ? gender : prev.gender,
    }));

    const oppId = searchParams.get("id");
    if (oppId && allOpportunities.length > 0) {
      const match = allOpportunities.find((o) => o.id === oppId);
      if (match) {
        setSelectedOpportunity(match);
      }
    }
  }, [searchParams, allOpportunities]);

  const handleResetFilters = () => {
    setFilters({
      searchQuery: "",
      lifeStage: "",
      type: "",
      state: "",
      casteCategory: "",
      gender: "",
      maxIncome: "",
    });
  };

  // Filter opportunities deterministically
  const filteredOpportunities = useMemo(() => {
    return allOpportunities.filter((opp) => {
      // 1. Search Query
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchTitle = opp.title.toLowerCase().includes(q);
        const matchProvider = (opp.provider || opp.providerName).toLowerCase().includes(q);
        const matchTags = (opp.tags || []).some((t) => t.toLowerCase().includes(q));
        const matchDesc = opp.description.toLowerCase().includes(q);
        if (!matchTitle && !matchProvider && !matchTags && !matchDesc) return false;
      }

      // 2. Type
      if (filters.type && opp.type !== filters.type) {
        return false;
      }

      // 3. Life Stage
      if (filters.lifeStage && !opp.targetLifeStages.includes(filters.lifeStage as any)) {
        return false;
      }

      // 4. State
      if (
        filters.state &&
        filters.state !== "All India (Central)" &&
        opp.stateJurisdiction !== "All India (Central)" &&
        opp.stateJurisdiction !== filters.state
      ) {
        return false;
      }

      // 5. Gender
      if (
        filters.gender &&
        !opp.eligibleGenders.includes("all") &&
        !opp.eligibleGenders.includes(filters.gender as any)
      ) {
        return false;
      }

      // 6. Caste Category
      if (
        filters.casteCategory &&
        !opp.casteCategories.includes("all") &&
        !opp.casteCategories.includes(filters.casteCategory as any)
      ) {
        return false;
      }

      // 7. Max Income
      if (filters.maxIncome && opp.maxFamilyIncome) {
        const threshold = parseInt(filters.maxIncome, 10);
        if (opp.maxFamilyIncome > threshold) {
          return false;
        }
      }

      return true;
    });
  }, [filters, allOpportunities]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24 lg:pb-12">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-2 border border-brand-200">
          <Layers className="w-3.5 h-3.5" />
          <span>Unified Citizen Opportunities Catalog</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Explore All Scholarships & Government Schemes
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Search and filter across central welfare schemes, state educational subsidies, and private trust grants.
        </p>

        {/* Demo Disclaimer Alert */}
        <div className="mt-4 p-3 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            {DEMO_DATA_NOTICE}
          </span>
        </div>
      </div>

      {/* Search Header */}
      <div className="mb-6">
        <SearchBar
          initialValue={filters.searchQuery}
          onSearch={(q) => setFilters((prev) => ({ ...prev, searchQuery: q }))}
          placeholder="Filter by title, keywords, or benefits (e.g. 'Engineering', 'PM-KISAN', 'Women')..."
        />
      </div>

      {/* Mobile filter toggle */}
      <div className="lg:hidden mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4 text-brand-600" />
          <span>{mobileFilterOpen ? "Hide Filters" : "Filter Opportunities"}</span>
        </button>
        <span className="text-xs font-semibold text-slate-500">
          Found <strong className="text-slate-900">{filteredOpportunities.length}</strong> items
        </span>
      </div>

      {/* Main Grid: Filters + Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters Desktop */}
        <div className={`lg:block ${mobileFilterOpen ? "block" : "hidden"} lg:col-span-1`}>
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
            totalResults={filteredOpportunities.length}
          />
        </div>

        {/* Cards Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3 flex-wrap">
            <span className="text-xs font-bold text-slate-700">
              Showing {filteredOpportunities.length} Verified Opportunities
            </span>
            {isLoading ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600" />
                <span>Syncing with Supabase...</span>
              </span>
            ) : (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                  dataSource === "supabase"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-slate-50 text-slate-700 border-slate-200"
                }`}
              >
                <Database className="w-3.5 h-3.5 text-brand-600" />
                <span>{dataSource === "supabase" ? "Supabase PostgreSQL Live" : "Supabase Engine Active"}</span>
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <OpportunityCardSkeleton count={4} />
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="No matching opportunities found"
              description="Try widening your filters, resetting social category or state, or searching for broader terms."
              actionText="Reset All Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredOpportunities.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  onOpenDetails={(item) => setSelectedOpportunity(item)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Opportunity Details Modal */}
      {selectedOpportunity && (
        <OpportunityDetailModal
          opportunity={selectedOpportunity}
          onClose={() => setSelectedOpportunity(null)}
        />
      )}
    </div>
  );
}

export default function OpportunitiesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading opportunities...</div>}>
      <OpportunitiesContent />
    </Suspense>
  );
}
