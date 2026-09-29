import React from "react";
import Link from "next/link";
import { ShieldCheck, Compass, Sparkles, BookOpen, ArrowRight, Award, Users, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About OpportunityX-AI | National Citizen Benefits & Scholarship Engine",
  description:
    "Learn about OpportunityX-AI, our mission to bridge information asymmetry in government scholarships and citizen welfare schemes across India.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-200">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span>Academic Hackathon Prototype • National Discovery Platform</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            About <span className="text-brand-600">OpportunityX-AI</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Bridging India&apos;s welfare and scholarship information gap through statutory data verification, 
            life-stage mapping, and intent-aware AI decision support.
          </p>
        </div>

        {/* Core Mission */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-brand-600" />
            Our Mission
          </h2>
          <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
            Every year, thousands of crores in central, state, and corporate scholarships and social welfare schemes go 
            unclaimed due to fragmented portals, complex eligibility rules, and awareness barriers. OpportunityX-AI was engineered 
            as an independent pre-screening decision engine that simplifies discovery, verifies eligibility requirements, and guides 
            citizens directly to official government portals.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">Zero Hallucination Policy</h3>
              <p className="text-xs text-slate-500">
                All scholarship criteria, deadlines, and benefits are strictly grounded in official guidelines from ministries.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">Whole-Life Coverage</h3>
              <p className="text-xs text-slate-500">
                Covers all 11 life stages from newborn maternal benefits and school education to senior citizen pensions.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">Official Portal Links</h3>
              <p className="text-xs text-slate-500">
                Direct external links to NSP, AICTE, and State SSP portals so applications are submitted securely to authorities.
              </p>
            </div>
          </div>
        </div>

        {/* Verification Architecture */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Platform Architecture & AI Advisor
          </h2>
          <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
            <p>
              The platform incorporates a deterministic rules engine alongside a conversational AI Advisor:
            </p>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Intent Classification:</strong> Differentiates conversational greetings and general thanks from statutory eligibility inquiries, deadline searches, and document requests.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Dual Persistence Engine:</strong> Operates seamlessly with Supabase cloud PostgreSQL backend with resilient local fallback for zero-downtime offline prototype availability.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Application Tracking:</strong> 5-stage lifecycle management (Planning, Applying, Submitted, Verification, Awarded).</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Callout */}
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
          <h3 className="font-bold text-sm text-amber-950 uppercase tracking-wider">
            Important Non-Governmental Notice
          </h3>
          <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
            OpportunityX-AI is an independent, non-governmental discovery and pre-screening decision-support tool created for an academic college hackathon. OpportunityX-AI does not disburse funds, charge any fees, or collect official application documents. All applications must be submitted directly through designated government websites.
          </p>
        </div>

        {/* Quick CTA */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/scholarships"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-colors shadow-sm"
          >
            <span>Explore Scholarships</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/ai-assistant"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm transition-colors border border-slate-200"
          >
            <span>Try AI Advisor</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
