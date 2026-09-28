"use client";

import React, { useState, useMemo } from "react";
import { SearchBar } from "@/components/common/SearchBar";
import { OpportunityCard } from "@/components/cards/OpportunityCard";
import { OpportunityCardSkeleton } from "@/components/common/OpportunityCardSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { DEMO_DATA_NOTICE } from "@/data/mockOpportunities";
import { useOpportunities } from "@/hooks/useOpportunities";
import { Landmark, Sparkles, ShieldCheck, Database, Loader2 } from "lucide-react";

export default function GovernmentSchemesPage() {
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");

  const { opportunities: allOpportunities, isLoading, dataSource } = useOpportunities();

  const schemeItems = useMemo(() => {
    return allOpportunities.filter((opp) => {
      // Must be government scheme or skill training
      const isScheme = opp.type === "scheme" || opp.type === "skill_training" || opp.type === "subsidy";
      if (!isScheme) return false;

      if (search) {
        const q = search.toLowerCase();
        const matchTitle = opp.title.toLowerCase().includes(q);
        const matchProvider = (opp.provider || opp.providerName).toLowerCase().includes(q);
        const matchTags = (opp.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchProvider && !matchTags) return false;
      }

      const lifeStages = opp.lifeStages || opp.targetLifeStages || [];
      if (sectorFilter === "farmers" && !lifeStages.includes("farmers")) return false;
      if (sectorFilter === "women" && !lifeStages.includes("women")) return false;
      if (sectorFilter === "families" && !lifeStages.includes("families")) return false;
      if (sectorFilter === "entrepreneurs" && !lifeStages.includes("entrepreneurs")) return false;

      return true;
    });
  }, [allOpportunities, search, sectorFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24 lg:pb-12 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2 border border-emerald-200">
          <Landmark className="w-3.5 h-3.5 text-emerald-600" />
          <span>Welfare, Subsidies & Direct Benefit Transfer</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Central & State Government Schemes
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Discover healthcare coverage, farmer income support, subsidized business credit, housing, and social security pensions.
        </p>

        <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{DEMO_DATA_NOTICE}</span>
        </div>
      </div>

      {/* Sector Quick Filters */}
      <div className="space-y-4">
        <SearchBar
          initialValue={search}
          onSearch={setSearch}
          placeholder="Search by scheme name, ministry, or benefit (e.g. 'PM-KISAN', 'Ayushman', 'PMEGP')..."
        />

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-slate-600">Filter Sector:</span>
          {[
            { id: "all", label: "All Welfare Schemes" },
            { id: "farmers", label: "Agriculture & Farmers" },
            { id: "women", label: "Women & Girls" },
            { id: "families", label: "Health & Housing" },
            { id: "entrepreneurs", label: "Micro-Enterprises & MSME" },
          ].map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => setSectorFilter(sec.id)}
              className={`px-3 py-1.5 text-xs rounded-xl font-semibold transition-all cursor-pointer ${
                sectorFilter === sec.id
                  ? "bg-emerald-700 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Grid */}
      <div className="pt-2">
        <div className="flex items-center justify-between gap-3 mb-5 border-b border-slate-200 pb-3 flex-wrap">
          <span className="text-xs font-bold text-slate-700">
            Showing {schemeItems.length} Verified Government Schemes
          </span>
          {isLoading ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600" />
              <span>Fetching from Supabase...</span>
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
              <span>{dataSource === "supabase" ? "Supabase Live" : "Supabase Engine"}</span>
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <OpportunityCardSkeleton count={4} />
          </div>
        ) : schemeItems.length === 0 ? (
          <EmptyState
            icon={Landmark}
            title="No welfare schemes match your criteria"
            description="Try changing the sector filter, searching with broader keywords, or checking all schemes."
            actionText="Reset Sector Filter"
            onAction={() => {
              setSectorFilter("all");
              setSearch("");
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schemeItems.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
