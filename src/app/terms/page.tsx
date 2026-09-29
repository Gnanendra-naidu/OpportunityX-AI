import React from "react";
import Link from "next/link";
import { FileText, ShieldAlert, ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use | OpportunityX-AI",
  description:
    "OpportunityX-AI Terms of Use and Non-Governmental Legal Disclaimer.",
};

export default function TermsOfUsePage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            <span>Legal Disclaimer & Usage Conditions</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Terms of Use
          </h1>
          <p className="text-xs text-slate-500">
            Effective Date: September 2026 • Please read carefully before using the platform
          </p>
        </div>

        {/* Content sections */}
        <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border border-slate-200 space-y-8 text-slate-700 text-sm leading-relaxed">
          {/* Prominent Statutory Disclaimer */}
          <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>STATUTORY NON-GOVERNMENTAL DISCLAIMER</span>
            </div>
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
              OpportunityX-AI is an independent, non-governmental informational tool developed for educational and hackathon presentation purposes. OpportunityX-AI is <strong>NOT</strong> affiliated with, operated by, or endorsed by the Government of India, the National Scholarship Portal, or any state government ministry.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              1. Informational & Pre-Screening Nature
            </h2>
            <p>
              OpportunityX-AI operates strictly as a pre-screening and discovery assistant. The matching calculations, eligibility percentage indicators, and AI Advisor suggestions are provided for guidance only.
            </p>
            <p>
              Official eligibility determination, document verification, application approval, and financial disbursements are the exclusive responsibility of the designated government ministries, universities, and issuing bodies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              2. Accuracy of Opportunity Information
            </h2>
            <p>
              While our database is synchronized with official government guidelines (such as NSP, AICTE, and State Gazette notifications), government ministries periodically revise scheme deadlines, income caps, and required documentation without prior notice.
            </p>
            <p>
              Users are advised to verify all critical deadlines, application windows, and eligibility criteria directly on the official portal linked on each opportunity detail page before submitting documentation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              3. No Fees or Application Collection
            </h2>
            <p>
              OpportunityX-AI is 100% free to use. We do not charge application processing fees, advisory fees, or convenience charges. If any party claims to represent OpportunityX-AI and requests money to secure a scholarship or government scheme, do not proceed.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              4. External Redirection & Third-Party Sites
            </h2>
            <p>
              Our application provides outbound links to external portals. We do not control or endorse the uptime, technical functionality, or privacy policies of third-party government websites.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              5. Limitation of Liability
            </h2>
            <p>
              Under no circumstances shall OpportunityX-AI, its creators, or hackathon contributors be liable for:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Rejection of any scholarship or welfare scheme application by an official authority.</li>
              <li>Missed application deadlines due to network delays or portal downtime.</li>
              <li>Changes made to scheme guidelines by government departments subsequent to our database updates.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              6. Acceptance of Terms
            </h2>
            <p>
              By accessing OpportunityX-AI, browsing scholarships, or using the AI Advisor, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
