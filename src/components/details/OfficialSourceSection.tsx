import React from "react";
import { ShieldAlert, ExternalLink, Globe, Calendar, Info } from "lucide-react";
import { validateAndNormalizeUrl } from "@/lib/opportunities/urls";

interface OfficialSourceSectionProps {
  providerName: string;
  providerType?: string;
  officialPortalUrl: string;
  applicationUrl: string;
  verifiedAt: string;
  className?: string;
}

export const OfficialSourceSection: React.FC<OfficialSourceSectionProps> = ({
  providerName,
  providerType,
  officialPortalUrl,
  applicationUrl,
  verifiedAt,
  className = "",
}) => {
  const portalInfo = validateAndNormalizeUrl(officialPortalUrl);
  const appInfo = validateAndNormalizeUrl(applicationUrl);

  const effectivePortalUrl = portalInfo.isAvailable ? portalInfo.url : (appInfo.isAvailable ? appInfo.url : "");
  const effectiveAppUrl = appInfo.isAvailable ? appInfo.url : (portalInfo.isAvailable ? portalInfo.url : "");

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-6 shadow-xs ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <Globe className="w-5 h-5 text-emerald-600" />
          <span>Official Source & Verification</span>
        </h3>
        <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
          <Calendar className="w-3 h-3 text-emerald-600" />
          <span>Audited {verifiedAt}</span>
        </span>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 mb-5">
        <div className="text-xs text-slate-500 font-medium">Nodal Authority / Provider:</div>
        <div className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">{providerName}</div>
        <div className="text-xs text-slate-500 mt-1 capitalize">
          Entity Class: {providerType ? providerType.replace("_", " ") : "Government / Autonomous Body"}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
        {effectivePortalUrl ? (
          <a
            href={effectivePortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm text-center flex items-center justify-center gap-1.5 transition-colors border border-slate-300/80"
          >
            <Globe className="w-4 h-4 text-slate-600" />
            <span>View Official Guidelines Portal</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </a>
        ) : (
          <span
            className="flex-1 py-3 px-4 rounded-xl bg-slate-100 text-slate-400 font-semibold text-xs sm:text-sm text-center flex items-center justify-center gap-1.5 border border-slate-200 cursor-not-allowed"
          >
            <Globe className="w-4 h-4 text-slate-400" />
            <span>Official guidelines link unavailable</span>
          </span>
        )}

        {effectiveAppUrl ? (
          <a
            href={effectiveAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm text-center flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <span>Apply on Official Portal</span>
            <ExternalLink className="w-3.5 h-3.5 text-white" />
          </a>
        ) : (
          <span
            className="flex-1 py-3 px-4 rounded-xl bg-slate-100 text-slate-400 font-semibold text-xs sm:text-sm text-center flex items-center justify-center gap-1.5 border border-slate-200 cursor-not-allowed"
          >
            <span>Official application link unavailable</span>
          </span>
        )}
      </div>

      {/* Official Disclaimer */}
      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-xs text-amber-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Institutional Advisory:</span> OpportunityX-AI provides verified discovery and pre-screening guidance. We do not accept fees or directly issue grants. Final eligibility, sanction, and disbursement are solely at the discretion of the issuing government department.
        </div>
      </div>
    </div>
  );
};
