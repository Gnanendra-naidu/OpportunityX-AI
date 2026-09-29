import React from "react";
import Link from "next/link";
import { Compass, GraduationCap, Bot, Bookmark, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Error Badge */}
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto text-2xl font-black shadow-sm">
            404
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            The page you are looking for might have been moved, removed, or is temporarily unavailable.
          </p>
        </div>

        {/* Quick Recovery Navigation */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-2.5 text-left">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
            Quick Navigation
          </div>
          <Link
            href="/"
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Compass className="w-4 h-4 text-brand-600" />
            <span>Return to Homepage</span>
          </Link>
          <Link
            href="/scholarships"
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <GraduationCap className="w-4 h-4 text-brand-600" />
            <span>Browse Scholarship Finder</span>
          </Link>
          <Link
            href="/ai-assistant"
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Bot className="w-4 h-4 text-purple-600" />
            <span>Ask the AI Opportunity Advisor</span>
          </Link>
          <Link
            href="/saved"
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Bookmark className="w-4 h-4 text-amber-600" />
            <span>View Saved Opportunities</span>
          </Link>
        </div>

        {/* Home Back Button */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
