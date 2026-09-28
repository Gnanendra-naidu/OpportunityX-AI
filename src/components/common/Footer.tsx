import React from "react";
import Link from "next/link";
import { ShieldAlert, ShieldCheck, Heart, ExternalLink, Globe } from "lucide-react";
import { LIFE_STAGES } from "@/data/lifeStages";

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mb-14 lg:mb-0">
      {/* Official Disclaimer Banner */}
      <div className="bg-slate-950/70 border-b border-slate-800/80 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex-shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="text-xs leading-relaxed text-slate-300">
            <span className="font-bold text-white uppercase tracking-wider block text-[11px] mb-0.5">
              Official Source Verification & Disclaimer Policy:
            </span>
            OpportunityX-AI is an independent, non-governmental discovery and pre-screening decision-support tool created for academic hackathon presentation. Opportunity listings are synchronized with publicly available guidelines from government portals (e.g., scholarships.gov.in, pmkisan.gov.in, digitalindia.gov.in). Final eligibility determination, document verification, application approval, and financial disbursements are handled strictly by the respective government ministries and issuing institutions.
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-black text-sm">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-white font-extrabold text-base tracking-tight">
                Opportunity<span className="text-brand-400">X</span>-AI
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Empowering Indian citizens across all life stages—from newborn welfare to senior citizen social security—with transparent, verified access to government schemes, scholarships, and grants.
            </p>
            <div className="pt-2 flex items-center gap-3 text-[11px] text-slate-400">
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                Hackathon Prototype
              </span>
              <span>Next.js • TypeScript • Tailwind</span>
            </div>
          </div>

          {/* Column 2: Quick Nav */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/scholarships" className="hover:text-white transition-colors">
                  Scholarship Finder
                </Link>
              </li>
              <li>
                <Link href="/schemes" className="hover:text-white transition-colors">
                  Government Schemes
                </Link>
              </li>
              <li>
                <Link href="/opportunities" className="hover:text-white transition-colors">
                  All Opportunities
                </Link>
              </li>
              <li>
                <Link href="/states" className="hover:text-white transition-colors">
                  Browse by State
                </Link>
              </li>
              <li>
                <Link href="/ai-assistant" className="hover:text-white transition-colors text-brand-400 font-medium">
                  AI Opportunity Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Life Stages */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Key Life Stages
            </h4>
            <ul className="space-y-2">
              {LIFE_STAGES.slice(0, 5).map((stage) => (
                <li key={stage.key}>
                  <Link
                    href={`/opportunities?stage=${stage.key}`}
                    className="hover:text-white transition-colors"
                  >
                    {stage.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/life-stages" className="text-brand-400 hover:text-brand-300 font-semibold">
                  View All 11 Stages →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Official Portals */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              National Portals
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a
                  href="https://scholarships.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>National Scholarship Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://pmkisan.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>PM-KISAN Samman Nidhi</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://pmjay.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>Ayushman Bharat PM-JAY</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.myscheme.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>myScheme Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <div>
            © {new Date().getFullYear()} OpportunityX-AI. Built for College Hackathon Presentation.
          </div>
          <div className="flex items-center gap-3">
            <span>Official Source Grounded</span>
            <span>•</span>
            <span>Zero Hallucinations Guarantee</span>
            <span>•</span>
            <Link
              href="/admin"
              className="text-amber-400 hover:text-amber-300 font-bold transition-colors inline-flex items-center gap-1"
            >
              <span>Admin / Demo Console</span>
              <span className="text-[10px] px-1 py-0.2 bg-amber-400/20 rounded font-mono">SANDBOX</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
