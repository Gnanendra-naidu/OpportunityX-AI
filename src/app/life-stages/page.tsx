"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LIFE_STAGES } from "@/data/lifeStages";
import { MOCK_OPPORTUNITIES, DEMO_DATA_NOTICE } from "@/data/mockOpportunities";
import { Opportunity, LifeStageInfo, LifeStageKey } from "@/types";
import { OpportunityCard } from "@/components/cards/OpportunityCard";
import { OpportunityDetailModal } from "@/components/details/OpportunityDetailModal";
import { useOpportunities } from "@/hooks/useOpportunities";
import {
  Baby,
  GraduationCap,
  BookOpen,
  Award,
  Briefcase,
  HeartHandshake,
  Sprout,
  Building2,
  Home,
  Accessibility,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
  SlidersHorizontal,
  Database,
  Loader2,
} from "lucide-react";

function LifeStagesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Selected stage key from URL query or default to 'college_students'
  const initialKey = (searchParams.get("stage") as LifeStageKey) || "college_students";
  const [selectedKey, setSelectedKey] = useState<LifeStageKey>(initialKey);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([
    "sch-aicte-pragati",
    "opp-karnataka-raitha-vidya-nidhi",
  ]);

  const activeStage: LifeStageInfo = useMemo(() => {
    const found = LIFE_STAGES.find((s) => s.key === selectedKey);
    return found || LIFE_STAGES[3]; // Fallback to college_students
  }, [selectedKey]);

  const handleSelectStage = (key: LifeStageKey) => {
    setSelectedKey(key);
    router.push(`/life-stages?stage=${key}`, { scroll: false });
  };

  const toggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Supabase dynamic opportunity loader
  const { opportunities: allOpportunities, isLoading, dataSource } = useOpportunities();

  // Filter opportunities for the selected life stage
  const stageOpportunities = useMemo(() => {
    return allOpportunities.filter((opp) => {
      const stages = opp.lifeStages || opp.targetLifeStages || [];
      // Match exact stage or handle newborn/children compatibility
      if (stages.includes(selectedKey)) return true;
      if (
        (selectedKey === "newborns_infants" || selectedKey === "children") &&
        stages.includes("newborns_children" as any)
      ) {
        return true;
      }
      return false;
    });
  }, [allOpportunities, selectedKey]);

  const getStageIcon = (iconName: string, className = "w-5 h-5") => {
    switch (iconName) {
      case "Baby":
        return <Baby className={className} />;
      case "GraduationCap":
        return <GraduationCap className={className} />;
      case "BookOpen":
        return <BookOpen className={className} />;
      case "Award":
        return <Award className={className} />;
      case "Briefcase":
        return <Briefcase className={className} />;
      case "HeartHandshake":
        return <HeartHandshake className={className} />;
      case "Sprout":
        return <Sprout className={className} />;
      case "Building2":
        return <Building2 className={className} />;
      case "Home":
        return <Home className={className} />;
      case "Accessibility":
        return <Accessibility className={className} />;
      case "ShieldCheck":
        return <ShieldCheck className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24 lg:pb-12 space-y-10">
      {/* ─────────────────────────────────────────────────────────────
          PAGE HEADER
          ───────────────────────────────────────────────────────────── */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-2 border border-brand-200 shadow-2xs">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span>Lifecycle Opportunity Architecture</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Explore Government Opportunities by Life Stage
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
          Welfare schemes and scholarships in India are structured to support citizens through pivotal life transitions. Select any stage to review tailored categories, eligibility criteria, and verified application portals.
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. 12-STAGE VISUAL SELECTION GRID
          ───────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Select Citizen Life Stage ({LIFE_STAGES.length} Stages)
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Click to switch active stage
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {LIFE_STAGES.map((stage) => {
            const isSelected = stage.key === selectedKey;
            return (
              <button
                key={stage.key}
                type="button"
                onClick={() => handleSelectStage(stage.key)}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between group cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-brand-500/40"
                    : "bg-white text-slate-800 border-slate-200/90 hover:border-brand-400 hover:shadow-xs"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                        isSelected
                          ? "bg-brand-600 text-white"
                          : "bg-slate-100 text-slate-600 group-hover:bg-brand-50 group-hover:text-brand-600"
                      }`}
                    >
                      {getStageIcon(stage.iconName, "w-4 h-4")}
                    </div>

                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                        isSelected
                          ? "bg-slate-800 text-slate-300"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {stage.ageRange.split(" ")[0]}
                    </span>
                  </div>

                  <h3
                    className={`font-bold text-xs sm:text-sm leading-tight transition-colors line-clamp-1 ${
                      isSelected
                        ? "text-white"
                        : "text-slate-900 group-hover:text-brand-600"
                    }`}
                  >
                    {stage.title}
                  </h3>
                </div>

                {isSelected && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-brand-300 font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-brand-400" />
                    <span>Active Stage</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. ACTIVE STAGE HERO & ELIGIBILITY DISCLAIMER
          ───────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-400/30">
                {getStageIcon(activeStage.iconName, "w-3.5 h-3.5")}
                <span>{activeStage.ageRange}</span>
              </span>
              <span className="text-xs text-slate-400">
                Found {stageOpportunities.length} opportunities for this life stage
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {activeStage.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              {activeStage.description}
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {activeStage.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] bg-slate-800 text-slate-200 px-2.5 py-0.5 rounded-md border border-slate-700 font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="self-start md:self-center">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("stage-opportunities-stream");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <span>View Eligible Schemes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Essential Eligibility Integrity Notice */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-white">Life Stage Eligibility Integrity Notice:</strong>{" "}
            Belonging to the <em>"{activeStage.title}"</em> stage does not mean every opportunity applies automatically. Each scheme establishes independent qualification rules—such as family income limits, minimum academic scores, state domicile, and social reservation categories. Please review the detailed eligibility card for each program below.
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. RELEVANT OPPORTUNITY CATEGORIES FOR THIS STAGE
          ───────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Relevant Opportunity Categories for {activeStage.title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Key areas of assistance and government support prioritized during this milestone.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {activeStage.relevantCategories?.map((cat, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-brand-400 transition-all flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                0{idx + 1}
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                  {cat}
                </h4>
                <span className="text-[11px] text-slate-500 mt-0.5 inline-block">
                  Verified Department Schemes
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. RELEVANT OPPORTUNITY CARDS STREAM (FROM DATA MODEL)
          ───────────────────────────────────────────────────────────── */}
      <section id="stage-opportunities-stream" className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              Schemes & Scholarships for {activeStage.title} ({stageOpportunities.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pre-screened against published guidelines for this developmental stage.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            {isLoading ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
                <Loader2 className="w-3 h-3 animate-spin text-brand-600" />
                <span>Loading from DB...</span>
              </span>
            ) : (
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                  dataSource === "supabase"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-slate-50 text-slate-700 border-slate-200"
                }`}
              >
                <Database className="w-3 h-3 text-brand-600" />
                <span>{dataSource === "supabase" ? "Supabase PostgreSQL Live" : "Supabase Engine Active"}</span>
              </span>
            )}
          </div>
        </div>

        {stageOpportunities.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800">
              No sample schemes currently linked for this specific life stage
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Our master database continuously syncs with National and State DBT portals. Check back or browse all opportunities across sectors.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stageOpportunities.map((opp) => (
              <div key={opp.id} className="relative">
                <OpportunityCard
                  opportunity={opp}
                  isSaved={savedIds.includes(opp.id)}
                  onToggleSave={toggleSave}
                  onOpenDetails={(item) => setSelectedOpportunity(item)}
                />
              </div>
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

export default function LifeStagesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading Life Stages System...</div>}>
      <LifeStagesContent />
    </Suspense>
  );
}
