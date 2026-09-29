import React from "react";
import Link from "next/link";
import { Shield, Lock, EyeOff, Database, CheckCircle2, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | OpportunityX-AI",
  description:
    "OpportunityX-AI Privacy Policy. Transparent details on how citizen parameters and user profiles are stored and protected.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-3 border-b border-slate-200 pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Data Protection & Privacy Commitment</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-500">
            Last Updated: September 2026 • Compliant with Indian Digital Personal Data Protection (DPDP) principles
          </p>
        </div>

        {/* Content sections */}
        <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-slate-200 space-y-8 text-slate-700 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-600" />
              1. Overview & Commitment
            </h2>
            <p>
              OpportunityX-AI (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the platform&rdquo;) is an open decision-support platform designed to help Indian citizens explore scholarships, grants, and welfare benefits. We believe privacy is a fundamental citizen right. We collect only the minimum socioeconomic parameters necessary to compute matching scores and eligibility recommendations.
            </p>
            <p className="font-semibold text-slate-900">
              We never sell, rent, or commercialize your personal or socioeconomic data under any circumstances.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-brand-600" />
              2. Information We Collect
            </h2>
            <p>
              When you use our eligibility matcher or save opportunities to your tracker, you may provide:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li><strong>Academic Parameters:</strong> Education level (e.g. Undergraduate, 10th), stream of study, marks percentage.</li>
              <li><strong>Demographic Information:</strong> Domicile state, district, age bracket, and gender.</li>
              <li><strong>Reservation & Socioeconomic Criteria:</strong> Caste category (General, OBC, SC, ST, EWS), annual family income range, minority status, and disability status.</li>
              <li><strong>Account Credentials:</strong> Email address and password (when registering an authenticated profile).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-brand-600" />
              3. How Your Information Is Used
            </h2>
            <p>
              Your information is used solely for the following purposes:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>Comparing your criteria against statutory government scholarship thresholds in our database.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>Displaying personalized match tiers (Likely Eligible, Review Required).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>Maintaining your application tracker and saved deadlines in your browser or authenticated account.</span>
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-brand-600" />
              4. Data Storage & Security
            </h2>
            <p>
              OpportunityX-AI implements security controls including:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>PostgreSQL Row Level Security (RLS) ensuring one user cannot read or access another citizen&apos;s saved applications or profile parameters.</li>
              <li>Complete isolation of database administrative tokens (zero service-role key exposure to browsers).</li>
              <li>SSL/TLS 256-bit encryption for all data in transit across Vercel edge networks.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              5. Third-Party Portals & External Redirection
            </h2>
            <p>
              When you click &ldquo;Apply on Official Portal&rdquo;, you leave OpportunityX-AI and navigate directly to official government portals (e.g. <code>scholarships.gov.in</code>). OpportunityX-AI does not transmit your personal data to external sites. Third-party government portals have their own independent privacy policies and data collection procedures.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              6. Your Rights & Data Deletion
            </h2>
            <p>
              You have the right to edit, modify, or completely delete your profile at any time through the Citizen Profile interface or by logging out and clearing your browser storage.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
