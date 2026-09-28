import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface EligibilitySectionProps {
  bullets: string[];
  maxIncome?: number;
  minAcademicPercentage?: number;
  minEducationLevel?: string;
  disabilityOnly?: boolean;
  className?: string;
}

export const EligibilitySection: React.FC<EligibilitySectionProps> = ({
  bullets,
  maxIncome,
  minAcademicPercentage,
  minEducationLevel,
  disabilityOnly,
  className = "",
}) => {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-6 shadow-xs ${className}`}>
      <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        <span>Eligibility Criteria & Conditions</span>
      </h3>

      {/* Snapshot badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        {maxIncome ? (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
              Income Ceiling
            </span>
            <span className="text-sm font-bold text-slate-800">
              ₹{maxIncome.toLocaleString("en-IN")} / year
            </span>
          </div>
        ) : null}

        {minAcademicPercentage ? (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
              Min. Academic Marks
            </span>
            <span className="text-sm font-bold text-slate-800">
              {minAcademicPercentage}% in prior exam
            </span>
          </div>
        ) : null}

        {minEducationLevel ? (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
              Required Education
            </span>
            <span className="text-sm font-bold text-slate-800 truncate block" title={minEducationLevel}>
              {minEducationLevel}
            </span>
          </div>
        ) : null}
      </div>

      {/* Detailed bullets */}
      <ul className="space-y-2.5 text-sm text-slate-700">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
              ✓
            </div>
            <span className="leading-relaxed">{b}</span>
          </li>
        ))}
      </ul>

      {disabilityOnly && (
        <div className="mt-4 p-3 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center gap-2.5 text-xs text-indigo-900">
          <AlertCircle className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <span>This opportunity is exclusively reserved for Persons with Disabilities (PwD) with valid UDID card.</span>
        </div>
      )}
    </div>
  );
};
