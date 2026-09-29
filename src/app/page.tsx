"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchBar } from "@/components/common/SearchBar";
import { OpportunityCard } from "@/components/cards/OpportunityCard";
import { LifeStageCard } from "@/components/cards/LifeStageCard";
import { CategoryCard } from "@/components/cards/CategoryCard";
import { DeadlineBadge } from "@/components/common/DeadlineBadge";
import { OfficialSourceBadge } from "@/components/common/OfficialSourceBadge";
import { MOCK_OPPORTUNITIES, STATES_LIST, DEMO_DATA_NOTICE } from "@/data/mockOpportunities";
import { LIFE_STAGES } from "@/data/lifeStages";
import { getVerifiedOpportunityUrl } from "@/lib/opportunities/urls";
import {
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Landmark,
  Sprout,
  HeartHandshake,
  Bot,
  CheckCircle2,
  FileCheck,
  TrendingUp,
  Clock,
  MapPin,
  Search,
  SlidersHorizontal,
  ChevronRight,
  HelpCircle,
  ExternalLink,
  Users,
  Award,
  Building,
  Lock,
  Compass,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  // Quick profile screener state
  const [screenerStage, setScreenerStage] = useState("college_students");
  const [screenerState, setScreenerState] = useState("Karnataka");
  const [screenerCategory, setScreenerCategory] = useState("all");

  const handleSearch = (query: string) => {
    if (query) {
      router.push(`/opportunities?q=${encodeURIComponent(query)}`);
    } else {
      router.push("/opportunities");
    }
  };

  const handleScreenerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      `/opportunities?stage=${screenerStage}&state=${encodeURIComponent(
        screenerState
      )}&category=${screenerCategory}`
    );
  };

  // Upcoming deadlines (schemes with actual closing dates)
  const upcomingDeadlineOpportunities = useMemo(() => {
    return MOCK_OPPORTUNITIES.filter(
      (opp) => !opp.isYearRound && opp.deadlineDate.startsWith("2026")
    ).slice(0, 3);
  }, []);

  // Featured flagship opportunities
  const featuredOpportunities = useMemo(() => {
    return MOCK_OPPORTUNITIES.slice(0, 4);
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 overflow-hidden">
      {/* ─────────────────────────────────────────────────────────────
          HERO SECTION
          ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white pt-12 sm:pt-20 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-7">
          {/* Logo / Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-brand-300 text-xs font-semibold backdrop-blur-md shadow-inner">
            <div className="w-5 h-5 rounded-md bg-brand-600 flex items-center justify-center text-white text-[10px] font-black">
              OX
            </div>
            <span className="text-slate-200">OpportunityX-AI</span>
            <span className="text-slate-500">•</span>
            <span className="text-brand-400">National Opportunity & Welfare Finder</span>
          </div>

          {/* Strong Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-[1.15]">
            Discover Scholarships & <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-sky-300 to-emerald-400">
              Government Opportunities
            </span>{" "}
            Matched to You
          </h1>

          {/* Short Explanation */}
          <p className="text-sm sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            A verified, AI-assisted discovery platform helping Indian citizens pre-screen eligibility for higher education scholarships, direct benefit transfer (DBT) welfare schemes, fellowships, and enterprise subsidies across all 11 life stages.
          </p>

          {/* Primary & Secondary Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/opportunities"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-lg shadow-brand-900/40 hover:shadow-brand-600/30 transition-all flex items-center justify-center gap-2 group"
            >
              <Compass className="w-4 h-4 text-brand-200 group-hover:rotate-45 transition-transform" />
              <span>Find Opportunities</span>
              <ArrowRight className="w-4 h-4 text-brand-200 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/scholarships"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-100 font-semibold text-sm border border-slate-700/80 transition-all flex items-center justify-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-sky-400" />
              <span>Explore Scholarships</span>
            </Link>
          </div>

          {/* Prominent Search Interface */}
          <div className="pt-6 max-w-3xl mx-auto">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search by keyword, scheme name, or beneficiary (e.g. 'Engineering', 'PM-KISAN', 'SC Students', 'Karnataka')..."
            />
          </div>

          {/* Key Metrics / Trust Bar */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-center border-t border-slate-800/80 mt-10">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white">500+</div>
              <div className="text-xs text-slate-400 font-medium">Mapped Opportunities</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-brand-400">11</div>
              <div className="text-xs text-slate-400 font-medium">Citizen Life Stages</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">28+8</div>
              <div className="text-xs text-slate-400 font-medium">States & UTs Covered</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400">100%</div>
              <div className="text-xs text-slate-400 font-medium">Official Source Grounded</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: FIND OPPORTUNITIES BASED ON YOUR PROFILE (Interactive Pre-Screener)
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-20">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider mb-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Instant Pre-Screener</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                1. Find Opportunities Based on Your Profile
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Answer 3 quick parameters to instantly filter scholarships, grants, and subsidies matching your background.
              </p>
            </div>
            <Link
              href="/profile"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1 self-start md:self-auto"
            >
              <span>Build Complete Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <form onSubmit={handleScreenerSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Your Current Life Stage
              </label>
              <select
                value={screenerStage}
                onChange={(e) => setScreenerStage(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              >
                {LIFE_STAGES.map((ls) => (
                  <option key={ls.key} value={ls.key}>
                    {ls.title} ({ls.ageRange})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                State Domicile / Residence
              </label>
              <select
                value={screenerState}
                onChange={(e) => setScreenerState(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              >
                {STATES_LIST.map((st) => (
                  <option key={st.name} value={st.name}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Social Category
              </label>
              <select
                value={screenerCategory}
                onChange={(e) => setScreenerCategory(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              >
                <option value="all">All Categories</option>
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
                <option value="EWS">EWS</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-brand-200" />
              <span>Show Matching Opportunities</span>
            </button>
          </form>

          <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 border-t border-slate-100">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Pre-screens against Central & State portals
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              No login required for initial discovery
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Clear document checklists provided
            </span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: BROWSE BY LIFE STAGE (All 11 Life Stages)
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs uppercase font-extrabold tracking-wider text-brand-600 mb-1">
              Inclusive Lifecycle Structure
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              2. Browse Opportunities by Life Stage
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Indian welfare programs target specific milestones. Select any of the 11 life stages to discover entitlements tailored to that phase of life.
            </p>
          </div>
          <Link
            href="/life-stages"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700"
          >
            <span>Life Stage Details</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {LIFE_STAGES.map((stage) => (
            <LifeStageCard key={stage.key} stage={stage} />
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: BROWSE BY CATEGORY
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs uppercase font-extrabold tracking-wider text-brand-600 mb-1">
              Sectoral Focus
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              3. Browse by Opportunity Category
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              From tuition assistance to micro-enterprise capital margin subsidies, explore by core mission.
            </p>
          </div>
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700"
          >
            <span>All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CategoryCard
            title="Higher Education & STEM"
            count={140}
            description="Fee reimbursement, AICTE engineering grants, girls in tech, and PhD stipends."
            href="/scholarships"
            iconBg="bg-blue-50"
            iconText="text-blue-600"
            icon={<GraduationCap className="w-6 h-6" />}
          />
          <CategoryCard
            title="Women Empowerment"
            count={75}
            description="Maternal nutrition grants, Sukanya Samriddhi savings, and SHG enterprise credit."
            href="/opportunities?stage=women"
            iconBg="bg-rose-50"
            iconText="text-rose-600"
            icon={<HeartHandshake className="w-6 h-6" />}
          />
          <CategoryCard
            title="Agriculture & Rural"
            count={52}
            description="PM-KISAN DBT installments, Kisan Credit Cards, crop insurance, and solar pumps."
            href="/opportunities?stage=farmers"
            iconBg="bg-lime-50"
            iconText="text-lime-700"
            icon={<Sprout className="w-6 h-6" />}
          />
          <CategoryCard
            title="Welfare & Social Security"
            count={95}
            description="Ayushman Bharat hospitalization, old age pensions, and PwD mobility aids."
            href="/schemes"
            iconBg="bg-indigo-50"
            iconText="text-indigo-600"
            icon={<Landmark className="w-6 h-6" />}
          />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: BROWSE BY STATE
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs uppercase font-extrabold tracking-wider text-brand-600 mb-1">
              Geographic Portals
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              4. Browse by State & Union Territory
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Many educational and welfare benefits are exclusive to state domiciliaries. Browse state-specific portals directly.
            </p>
          </div>
          <Link
            href="/states"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700"
          >
            <span>All States & UTs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {STATES_LIST.slice(0, 12).map((st) => (
            <Link
              key={st.code}
              href={`/opportunities?state=${encodeURIComponent(st.name)}`}
              className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-brand-500 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-brand-600 transition-colors">
                  {st.code}
                </span>
                <MapPin className="w-3 h-3 text-slate-300 group-hover:text-brand-500 transition-colors" />
              </div>
              <div className="font-bold text-xs sm:text-sm text-slate-800 group-hover:text-brand-600 transition-colors truncate">
                {st.name}
              </div>
              <span className="text-[10px] text-slate-500 mt-1">
                {st.count} schemes
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: UPCOMING DEADLINES
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                <Clock className="w-3.5 h-3.5" />
                <span>Time Sensitive</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                5. Upcoming Application Deadlines
              </h2>
              <p className="text-xs text-slate-400">
                Don't miss these critical submission windows closing in the current cycle.
              </p>
            </div>
            <Link
              href="/saved"
              className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              <span>Track Deadlines in Personal Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingDeadlineOpportunities.map((opp) => (
              <div
                key={opp.id}
                className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between space-y-4 hover:border-slate-500 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-400/30">
                      {opp.type}
                    </span>
                    <DeadlineBadge deadlineDate={opp.deadlineDate} />
                  </div>
                  <h3 className="font-bold text-sm text-white line-clamp-2 leading-snug">
                    <Link
                      href={`/scholarships?id=${opp.id}`}
                      className="hover:text-brand-300 hover:underline transition-colors"
                      title="View scholarship details and guidelines"
                    >
                      {opp.title}
                    </Link>
                  </h3>
                  <div className="text-xs text-slate-400 mt-1 truncate">
                    {opp.providerName}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-700/80 flex items-center justify-between text-xs">
                  <div className="font-bold text-emerald-400">{opp.financialAmount}</div>
                  {(() => {
                    const verifiedUrl = getVerifiedOpportunityUrl(opp);
                    if (!verifiedUrl.isAvailable) {
                      return (
                        <span
                          className="text-xs text-slate-500 cursor-not-allowed"
                          title="Official portal application link is not available for this record"
                        >
                          Link unavailable
                        </span>
                      );
                    }
                    return (
                      <a
                        href={verifiedUrl.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-400 hover:text-brand-300 hover:underline"
                      >
                        <span>{verifiedUrl.label || "Official Portal"}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 6: FEATURED OPPORTUNITIES
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold mb-1 border border-emerald-200">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Flagship National Programs</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              6. Featured Scholarships & Welfare Schemes
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              High-impact programs with broad eligibility criteria and substantial grant allocations.
            </p>
          </div>
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredOpportunities.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 7: HOW OPPORTUNITYX-AI WORKS
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-xs uppercase font-extrabold tracking-wider text-brand-600 mb-1">
            Engine Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            7. How OpportunityX-AI Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            A 4-step deterministic discovery flow designed to eliminate confusion and protect applicants from misleading claims.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 font-black text-sm flex items-center justify-center border border-brand-200">
              01
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Build Profile
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enter your life stage, domicile state, education level, social category, and annual family income bracket.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 font-black text-sm flex items-center justify-center border border-sky-200">
              02
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Deterministic Rules
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our matching engine excludes non-eligible schemes through strict hard filters (state, income, gender, qualifications).
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 font-black text-sm flex items-center justify-center border border-purple-200">
              03
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Document Readiness
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Get an explicit checklist of certificates required (Aadhaar, Income Certificate, Marksheet, Domicile, UDID) before applying.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 font-black text-sm flex items-center justify-center border border-emerald-200">
              04
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Official Submission
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Direct one-click access to authoritative portals (NSP, PM-KISAN, State DBT) for legitimate government submission.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 8: WHY OFFICIAL-SOURCE VERIFICATION MATTERS
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 space-y-8">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Trust, Safety & Governance</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              8. Why Official-Source Verification Matters
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every year, thousands of students and low-income families are deceived by phishing websites mimicking government portals. OpportunityX-AI is engineered with strict safeguards:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white">
                Only Verified Domains (.gov.in / .nic.in)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                All external application links are auditable and strictly point to official sovereign portals or registered non-profit trust domains.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white">
                Zero Financial Intermediation
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                OpportunityX-AI never asks for payment, processing fees, or bank account credentials. All transactions happen through official Direct Benefit Transfer (DBT).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white">
                Pre-Screen Estimates Only
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                We make no false promises. Our match score represents a preliminary qualification check; final sanction always rests solely with the nodal ministry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 9: AI ASSISTANT SECTION
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-brand-900 via-slate-900 to-indigo-950 p-8 sm:p-12 text-white border border-brand-800 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-400/30 text-xs font-semibold">
              <Bot className="w-4 h-4 text-brand-400" />
              <span>9. Conversational Opportunity Advisor</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ask Any Question in Natural Language
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Unsure if you qualify for AICTE Pragati or NMMS? Tell our AI Assistant about your coursework, category, and state domicile. It provides grounded answers cited from government guidelines without hallucinating fake deadlines or non-existent grants.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Grounded RAG Pipeline</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <FileCheck className="w-3.5 h-3.5 text-brand-400" />
                <span>Document Checklists</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>Zero Hallucinations</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <Link
              href="/ai-assistant"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm text-center shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Bot className="w-4 h-4" />
              <span>Open AI Assistant</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 10: CALL TO ACTION
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>10. Start Your Discovery Journey</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Never Miss an Opportunity You Are Entitled To.
        </h2>

        <p className="text-xs sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Join thousands of students, farmers, job seekers, and families discovering verified scholarships and welfare benefits tailored to their life stage.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/opportunities"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Explore All Opportunities</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/profile"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 transition-all flex items-center justify-center"
          >
            <span>Complete Profile Match</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
