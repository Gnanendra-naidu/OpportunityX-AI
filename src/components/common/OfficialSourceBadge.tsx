import React from "react";
import { ShieldCheck, ExternalLink } from "lucide-react";

import { validateAndNormalizeUrl } from "@/lib/opportunities/urls";

interface OfficialSourceBadgeProps {
  url?: string;
  verifiedAt?: string;
  providerType?: string;
  showLinkIcon?: boolean;
  className?: string;
}

export const OfficialSourceBadge: React.FC<OfficialSourceBadgeProps> = ({
  url,
  verifiedAt,
  providerType = "Govt. Entity",
  showLinkIcon = true,
  className = "",
}) => {
  const norm = validateAndNormalizeUrl(url);

  const badge = (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs ${className}`}
      title={verifiedAt ? `Source Verified on ${verifiedAt}` : "Official source verified"}
    >
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
      <span>Official Portal</span>
      {verifiedAt && (
        <span className="text-[10px] text-emerald-600 font-normal hidden sm:inline">
          (Checked {verifiedAt})
        </span>
      )}
      {showLinkIcon && norm.isAvailable && <ExternalLink className="w-3 h-3 text-emerald-700 ml-0.5" />}
    </div>
  );

  if (norm.isAvailable && norm.url) {
    return (
      <a
        href={norm.url}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:opacity-90 transition-opacity"
        title="Opens official issuing portal in a new tab"
      >
        {badge}
      </a>
    );
  }

  return badge;
};
